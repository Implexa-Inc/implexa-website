// generate-openapi.js — emit an OpenAPI 3.1 descriptor of the implexa MCP
// tool catalog for the AEO surface served at /developers/openapi.json.
//
//   node scripts/generate-openapi.js
//
// Re-run whenever backend tools are added/changed, then commit the updated
// src/lib/openapi-spec.json.
//
// Source of truth is the backend MCP registry (implexa-backend/src/mcp/tools).
// The website and backend are separate repos/deploys, so we generate a static
// artifact at author time rather than importing the registry at build time.
// This script lives in the website repo (so the whole AEO surface ships on one
// branch) but resolves the backend's OWN zod + zod-to-json-schema via
// createRequire: the tool schemas were authored against the backend's zod
// (v3), and running them through the website's zod (v4) would misread the
// internal _def shapes. Anchoring resolution at the backend package keeps the
// output identical no matter which directory you run from.
//
// The MCP transport is a single streamable-http JSON-RPC endpoint, not a REST
// API. OpenAPI can't model JSON-RPC natively, so we use the common
// introspection convention: one POST operation per tool, keyed at /<tool_name>,
// with the tool's input schema as the requestBody. Agents/devs get a
// machine-readable catalog (name + description + input shape per tool) without
// pretending each tool is its own HTTP route. The skill-page HowTo JSON-LD
// links each tool to #/paths/~1<tool_name> here.

const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");

// Resolve the sibling backend repo. Override with IMPLEXA_BACKEND_DIR if the
// checkout layout differs.
const BACKEND_DIR =
  process.env.IMPLEXA_BACKEND_DIR ||
  path.resolve(__dirname, "../../implexa-backend");

const backendPkg = path.join(BACKEND_DIR, "package.json");
if (!fs.existsSync(backendPkg)) {
  console.error(
    `backend not found at ${BACKEND_DIR}. set IMPLEXA_BACKEND_DIR to the implexa-backend checkout.`,
  );
  process.exit(1);
}

// All backend-side modules (the registry, zod, the converter) resolve from the
// backend's node_modules via this require.
const brequire = createRequire(backendPkg);
const { z } = brequire("zod");
const zodToJsonSchemaModule = brequire("zod-to-json-schema");
const zodToJsonSchema =
  zodToJsonSchemaModule.zodToJsonSchema ||
  zodToJsonSchemaModule.default ||
  zodToJsonSchemaModule;
const tools = brequire("./src/mcp/tools/index.js");

const OUT_PATH = path.resolve(__dirname, "../src/lib/openapi-spec.json");

const SERVER_URL =
  process.env.IMPLEXA_MCP_URL || "https://core.implexa.ai/api/v2/mcp";

// Convert a tool's Zod schema shape ({ field: zodType, ... }) into a JSON
// Schema object. Empty-schema tools (no args) become an empty object schema.
function inputSchemaFor(tool) {
  const shape = tool.impl && tool.impl.schema ? tool.impl.schema : {};
  const keys = Object.keys(shape);
  if (keys.length === 0) {
    return { type: "object", properties: {}, additionalProperties: false };
  }
  // The registry stores schemas as a plain object of Zod types (the shape MCP
  // expects), not a z.object. Wrap it so the converter can walk it.
  const obj = z.object(shape);
  const json = zodToJsonSchema(obj, {
    target: "jsonSchema7",
    // Inline everything. $ref/definitions don't survive a single-operation
    // requestBody cleanly and bloat the doc for crawlers.
    $refStrategy: "none",
  });
  // zod-to-json-schema wraps output with a $schema key; drop it (the parent
  // OpenAPI doc declares its own dialect).
  delete json.$schema;
  return json;
}

// First sentence of the description, for the operation summary. Tools carry
// long, prose-y descriptions; the summary should be a one-liner.
function summaryFor(description) {
  if (!description) return undefined;
  const firstLine = description.split(/\n/)[0].trim();
  const m = /^(.{1,140}?[.!?])(\s|$)/.exec(firstLine);
  const s = m ? m[1] : firstLine.slice(0, 140);
  return s.trim();
}

const paths = {};
let count = 0;

for (const tool of tools) {
  if (!tool || !tool.name) continue;
  const inputSchema = inputSchemaFor(tool);
  paths[`/${tool.name}`] = {
    post: {
      operationId: tool.name,
      summary: summaryFor(tool.description),
      description: tool.description || undefined,
      tags: ["mcp-tools"],
      requestBody: {
        required: Object.keys(inputSchema.properties || {}).length > 0,
        content: {
          "application/json": {
            schema: inputSchema,
          },
        },
      },
      responses: {
        "200": {
          description:
            "Tool result envelope. Most tools return { ok: boolean, ... }; shape varies per tool.",
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
      },
    },
  };
  count += 1;
}

const spec = {
  openapi: "3.1.0",
  info: {
    title: "implexa MCP tool catalog",
    // Lowercase voice to match the site. No em-dashes.
    description:
      "machine-readable catalog of the implexa MCP server. implexa is google + wikipedia for SKILL.md, cross-vendor. these tools run over a single streamable-http MCP endpoint, not as separate REST routes. each path below documents one MCP tool: its name (operationId), what it does (description), and its input shape (requestBody). call them through an MCP client (claude code, codex, cursor, gemini cli) or the claude.ai connector, not as plain HTTP POSTs.",
    version: "0.1.0",
    contact: {
      name: "implexa",
      email: "founder@implexa.ai",
      url: "https://implexa.ai/developers",
    },
    license: {
      name: "proprietary",
    },
  },
  servers: [
    {
      url: SERVER_URL,
      description: "implexa MCP server (streamable-http transport)",
    },
  ],
  externalDocs: {
    description: "implexa developers + MCP integration",
    url: "https://implexa.ai/developers",
  },
  tags: [
    {
      name: "mcp-tools",
      description:
        "tools exposed over the implexa MCP server. invoke via an MCP client, not raw HTTP.",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        // Implexa keys are formatted rvk_live_*. Documented in bearerFormat so
        // introspecting agents know the token shape.
        bearerFormat: "rvk_live_*",
        description:
          "bearer token. format: Authorization: Bearer rvk_live_.... get a key at app.implexa.ai. a subset of read-only tools (recommend_skills_for_context, get_aggregated_skill, list_aggregated_skills, get_related_skills, get_skill_score, get_skill_content, count_skills) work without auth.",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths,
};

fs.writeFileSync(OUT_PATH, JSON.stringify(spec, null, 2) + "\n", "utf8");
console.log(`wrote ${count} tools to ${OUT_PATH}`);
