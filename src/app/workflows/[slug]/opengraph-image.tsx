import { ImageResponse } from "next/og";
import { getWorkflow } from "@/lib/workflow-catalog";
import { resolveQuery, hasResolvedQuery } from "@/lib/workflow-query";
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

// Per-workflow OG card. Replaces the static DEFAULT_OG_IMAGE the metadata used
// to point at, so a shared or answer-engine-cited /workflows/<slug> link gets a
// real titled card (better CTR). Dynamic (no generateStaticParams): the detail
// page is itself backend-sourced and dynamic, and getWorkflow returns null
// without IMPLEXA_PUBLIC_SEARCH_TOKEN, so we render on demand and fall back to
// the slug when the backend is unavailable rather than failing the build.

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "implexa agent";

type RouteParams = { slug: string };

export default async function Image(props: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await props.params;
  const workflow = await getWorkflow(slug);
  // Lead the card with the query (the thought), matching the page H1 so a
  // shared or answer-engine-cited link previews as the question it answers.
  const title = workflow
    ? resolveQuery(workflow)
    : slug.replace(/-/g, " ");
  const description = workflow
    ? hasResolvedQuery(workflow)
      ? `the ${workflow.name} agent answers this`
      : workflow.primary_outcome || workflow.description || undefined
    : undefined;

  return new ImageResponse(
    renderOgCard({
      title,
      description,
      eyebrow: "agent",
      footer: `implexa.ai/workflows/${slug}`,
    }),
    { ...size },
  );
}
