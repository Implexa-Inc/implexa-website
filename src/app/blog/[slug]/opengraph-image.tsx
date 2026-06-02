import { ImageResponse } from "next/og";
import { getBlogPost, getBlogSlugs } from "@/lib/blog";
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-card";

// Per-post OG card. Replaces the dead `/og-blog-<slug>.png` static reference.
// Node runtime (default) — getBlogPost reads markdown off the filesystem;
// prerendered at build via generateStaticParams.

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "implexa blog";

type RouteParams = { slug: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Image(props: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await props.params;
  const post = await getBlogPost(slug);
  const title = post?.frontmatter.title ?? slug.replace(/-/g, " ");
  const description = post?.frontmatter.description;

  return new ImageResponse(
    renderOgCard({
      title,
      description,
      eyebrow: "blog",
      footer: `implexa.ai/blog/${slug}`,
    }),
    { ...size },
  );
}
