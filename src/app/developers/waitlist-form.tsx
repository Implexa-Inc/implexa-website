"use client";

// Client wrapper around the partner waitlist server action.
//
// useActionState gives us {state, formAction, pending} for free, which
// covers progressive enhancement (the form posts even with JS off, the
// server action runs, and Next re-renders with the returned state) AND
// the no-JS-required pending-button affordance.
//
// We intentionally keep this small: the visual language is the same as
// every other panel on the site (zinc-950 panel, zinc-900 border, single
// accent for the submit button). The "thanks" state replaces the form
// in-place so the user gets a visible commitment from the server.

import { useActionState } from "react";
import { Check, Mail } from "lucide-react";
import { submitPartnerWaitlist } from "./actions";
import { initialWaitlistState, type WaitlistState } from "./waitlist-state";

// Light wrapper utility so the field components below stay readable.
// (Adding `cn()` from lib/utils felt like overkill for two call sites.)
function fieldClasses(hasError: boolean): string {
  return [
    "w-full bg-black border rounded-md px-3 py-2 text-sm text-white",
    "placeholder:text-zinc-600",
    "focus:outline-none focus:ring-1",
    hasError
      ? "border-amber-500/60 focus:border-amber-400 focus:ring-amber-400/30"
      : "border-zinc-800 focus:border-zinc-600 focus:ring-zinc-600/30",
  ].join(" ");
}

export function PartnerWaitlistForm() {
  const [state, formAction, pending] = useActionState<WaitlistState, FormData>(
    submitPartnerWaitlist,
    initialWaitlistState,
  );

  if (state.status === "ok") {
    return (
      <div
        className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-6"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="size-7 rounded-md bg-emerald-500/10 border border-emerald-900/40 inline-flex items-center justify-center">
            <Check className="size-3.5 text-emerald-400" aria-hidden="true" />
          </div>
          <span className="text-xs text-emerald-400/80 font-mono uppercase tracking-wider">
            on the list
          </span>
        </div>
        <p className="text-base text-white mb-1">{state.message}</p>
        <p className="text-sm text-zinc-400">
          questions in the meantime? email{" "}
          <a
            href="mailto:founder@implexa.ai"
            className="text-zinc-200 hover:text-white underline decoration-zinc-700 underline-offset-2"
          >
            founder@implexa.ai
          </a>
          .
        </p>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="rounded-lg border border-zinc-900 bg-zinc-950 p-6 space-y-4"
      noValidate
    >
      <div>
        <label
          htmlFor="waitlist-email"
          className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1.5"
        >
          work email
        </label>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@yourcompany.com"
          aria-invalid={errors.email ? "true" : undefined}
          aria-describedby={errors.email ? "waitlist-email-error" : undefined}
          className={fieldClasses(!!errors.email)}
        />
        {errors.email ? (
          <p
            id="waitlist-email-error"
            className="mt-1 text-xs text-amber-400/90"
          >
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="waitlist-product"
          className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1.5"
        >
          product or company
        </label>
        <input
          id="waitlist-product"
          name="product"
          type="text"
          required
          maxLength={120}
          placeholder="e.g. mastra, continue.dev, your-internal-agent"
          aria-invalid={errors.product ? "true" : undefined}
          aria-describedby={
            errors.product ? "waitlist-product-error" : undefined
          }
          className={fieldClasses(!!errors.product)}
        />
        {errors.product ? (
          <p
            id="waitlist-product-error"
            className="mt-1 text-xs text-amber-400/90"
          >
            {errors.product}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="waitlist-use-case"
          className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1.5"
        >
          intended use case
        </label>
        <textarea
          id="waitlist-use-case"
          name="useCase"
          required
          rows={4}
          minLength={20}
          maxLength={2000}
          placeholder="how do you want to call implexa? ambient recommender in an IDE, ranking source for a marketplace, etc."
          aria-invalid={errors.useCase ? "true" : undefined}
          aria-describedby={
            errors.useCase ? "waitlist-use-case-error" : undefined
          }
          className={fieldClasses(!!errors.useCase) + " resize-y"}
        />
        {errors.useCase ? (
          <p
            id="waitlist-use-case-error"
            className="mt-1 text-xs text-amber-400/90"
          >
            {errors.useCase}
          </p>
        ) : null}
      </div>

      {state.status === "error" && !state.fieldErrors ? (
        <p
          className="text-sm text-amber-300/90 bg-amber-950/20 border border-amber-900/40 rounded-md px-3 py-2"
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-xs text-zinc-500">
          we read every entry. no automated emails.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-white text-black hover:bg-zinc-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium text-sm transition-colors"
        >
          <Mail className="size-3.5" aria-hidden="true" />
          {pending ? "joining…" : "join the waitlist"}
        </button>
      </div>
    </form>
  );
}
