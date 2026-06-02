// Extract FAQ question/answer pairs from a markdown body so a page can emit
// FAQPage JSON-LD. Handles the two FAQ shapes used across our posts:
//   - an "## FAQ" / "## faq" section with "### Question" subheadings, and
//   - the same section with whole-line "**Question**" bold lines.
// The answer is the prose following a question up to the next question or
// heading. Markdown emphasis + links are stripped so the schema text is plain.

export type FaqItem = { question: string; answer: string };

function stripMd(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [text](url) -> text
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractFaq(markdown: string): FaqItem[] {
  if (!markdown) return [];
  const lines = markdown.split(/\r?\n/);

  // Locate the FAQ section heading and its level.
  let start = -1;
  let level = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{2,4})\s*(faq|frequently asked questions)\b/i);
    if (m) {
      start = i + 1;
      level = m[1].length;
      break;
    }
  }
  if (start === -1) return [];

  // Collect the section body: everything until the next heading at the FAQ
  // level or shallower (a sibling/parent section ends the FAQ).
  const section: string[] = [];
  for (let i = start; i < lines.length; i++) {
    const h = lines[i].match(/^(#{1,6})\s/);
    if (h && h[1].length <= level) break;
    section.push(lines[i]);
  }

  // Parse Q&A. A question is a deeper heading (### ...) or a whole-line bold
  // (**...**). The answer is the following non-empty prose.
  const items: FaqItem[] = [];
  let question: string | null = null;
  let answer: string[] = [];
  const flush = () => {
    if (question) {
      const text = answer.join(" ").trim();
      if (text) items.push({ question, answer: text });
    }
  };

  for (const rawLine of section) {
    const line = rawLine.trim();
    const head = line.match(/^#{2,6}\s+(.*\S)\s*$/);
    const bold = line.match(/^\*\*(.+?)\*\*:?\s*$/);
    if (head) {
      flush();
      question = stripMd(head[1]);
      answer = [];
    } else if (bold) {
      flush();
      question = stripMd(bold[1]);
      answer = [];
    } else if (line && question) {
      answer.push(stripMd(line));
    }
  }
  flush();

  return items.filter((it) => it.question && it.answer).slice(0, 12);
}
