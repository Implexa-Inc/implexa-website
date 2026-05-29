import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // scripts/ holds deployment artifacts for sibling repos (backend
    // route handlers, SQL migrations). They follow the conventions of
    // their destination repo (CommonJS require() etc), not the website's
    // ESM/TS lint rules. See scripts/partner-waitlist/README.md.
    "scripts/**",
  ]),
]);

export default eslintConfig;
