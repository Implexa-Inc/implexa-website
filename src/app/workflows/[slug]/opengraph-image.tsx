import { ImageResponse } from "next/og";
import { getWorkflow } from "@/lib/workflow-catalog";
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

// Per-workflow OG card. Replaces the static DEFAULT_OG_IMAGE the metadata used
// to point at, so a shared or answer-engine-cited /workflows/<slug> link gets a
// real titled card (better CTR). Dynamic (no generateStaticParams): the detail
// page is itself backend-sourced and dynamic, and getWorkflow returns null
// without IMPLEXA_PUBLIC_SEARCH_TOKEN, so we render on demand and fall back to
// the slug when the backend is unavailable rather than failing the build.

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "implexa workflow";

type RouteParams = { slug: string };

export default async function Image(props: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await props.params;
  const workflow = await getWorkflow(slug);
  const title = workflow?.name ?? slug.replace(/-/g, " ");
  const description =
    workflow?.primary_outcome || workflow?.description || undefined;

  return new ImageResponse(
    renderOgCard({
      title,
      description,
      eyebrow: "workflow",
      footer: `implexa.ai/workflows/${slug}`,
    }),
    { ...size },
  );
}
