import { ImageResponse } from "next/og";
import { getResource, getResourceSlugs } from "@/lib/resources";
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

// Per-resource OG card. Replaces the dead `/og-resources-<slug>.png` static
// reference the metadata used to point at. Runs on the node runtime (default)
// because getResource reads markdown off the filesystem; prerendered at build
// via generateStaticParams below.

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "implexa resource";

type RouteParams = { slug: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  const slugs = await getResourceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Image(props: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await props.params;
  const resource = await getResource(slug);
  const title = resource?.frontmatter.title ?? slug.replace(/-/g, " ");
  const description = resource?.frontmatter.description;

  return new ImageResponse(
    renderOgCard({
      title,
      description,
      eyebrow: "resource",
      footer: `implexa.ai/resources/${slug}`,
    }),
    { ...size },
  );
}
