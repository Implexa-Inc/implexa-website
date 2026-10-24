// node --experimental-strip-types --test src/lib/faq.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractFaq } from "./faq.ts";

const md = (q: string, a: string) => `## Frequently asked questions\n\n### ${q}\n\n${a}\n`;

test("keeps intra-word underscores in questions and answers", () => {
  const [item] = extractFaq(md(
    'Why does pip fail with "metadata_errors"?',
    "Set `approval_policy` and check metadata_errors.",
  ));
  assert.equal(item.question, 'Why does pip fail with "metadata_errors"?');
  assert.equal(item.answer, "Set approval_policy and check metadata_errors.");
});

test("still strips underscore and asterisk emphasis", () => {
  const [item] = extractFaq(md("Is it _really_ __free__?", "It is *mostly* **free**."));
  assert.equal(item.question, "Is it really free?");
  assert.equal(item.answer, "It is mostly free.");
});

test("still strips links and backticks", () => {
  const [item] = extractFaq(md("Where?", "See [the guide](/blog/x) and run `npx skills add`."));
  assert.equal(item.answer, "See the guide and run npx skills add.");
});
