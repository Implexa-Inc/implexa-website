import { ImageResponse } from "next/og";
import { getGuide, getGuideSlugs } from "@/lib/guides";
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

// Per-guide OG card. Replaces the dead `/og-guides-<slug>.png` static
// reference. Node runtime (default) — getGuide reads markdown off the
// filesystem; prerendered at build via generateStaticParams.

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "implexa guide";

type RouteParams = { slug: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  const slugs = await getGuideSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Image(props: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await props.params;
  const guide = await getGuide(slug);
  const title = guide?.frontmatter.title ?? slug.replace(/-/g, " ");
  const description = guide?.frontmatter.description;

  return new ImageResponse(
    renderOgCard({
      title,
      description,
      eyebrow: "guide",
      footer: `implexa.ai/guides/${slug}`,
    }),
    { ...size },
  );
}
