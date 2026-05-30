import spec from "@/lib/openapi-spec.json";

// /developers/openapi.json — OpenAPI 3.1 descriptor of the implexa MCP tool
// catalog. The AEO surface for agents/devs that want to introspect implexa's
// capabilities programmatically (60 tools: name, description, input schema).
//
// The spec is a committed static artifact generated from the backend MCP
// registry by implexa-backend/scripts/generate-openapi.js. The website and
// backend are separate deploys, so we don't import the registry at build
// time. Re-run that script whenever tools change, then commit the updated
// src/lib/openapi-spec.json.
//
// force-static + revalidate makes this a build-time-frozen response: there's
// no runtime data, so Next prerenders it once and serves it from the edge
// cache. The 24h revalidate window matches the rest of the AEO surfaces and
// is moot until the committed spec changes (which only happens on redeploy).

export const dynamic = "force-static";
export const revalidate = 86400;

export function GET(): Response {
  return new Response(JSON.stringify(spec), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=600, s-maxage=86400",
    },
  });
}
