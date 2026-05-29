// Types + initial state for the partner waitlist server action.
//
// This file lives separately from actions.ts because Next 16 enforces that
// a "use server" module exports only async functions. Constants and types
// have to be imported from a sibling regular module. Keeping them here
// also makes the client component (waitlist-form.tsx) able to consume
// the types without pulling in the server action's transitive deps.

export type WaitlistState = {
  // 'idle' is the starting state (no submission yet). 'ok' after a
  // successful write. 'error' for anything the user can fix. The client
  // component switches the form panel out for a "thanks" panel when ok.
  status: "idle" | "ok" | "error";
  message: string;
  // field-level errors, used to highlight inputs on the client.
  fieldErrors?: Partial<Record<"email" | "product" | "useCase", string>>;
};

export const initialWaitlistState: WaitlistState = {
  status: "idle",
  message: "",
};
