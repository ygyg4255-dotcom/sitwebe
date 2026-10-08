/**
 * Minimal, SAFE Markdown renderer for blog content stored in the database.
 *
 * Supports exactly the subset authors use (see supabase/seed.sql):
 * `##` / `###` headings, paragraphs, `-` bullet lists, `**bold**`.
 * Content becomes React elements — React escapes all text, so database
 * content can NEVER inject HTML or scripts.
 */
import { Fragment, type ReactNode } from "react";

/** Splits `**bold**` segments into text/strong nodes. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((part, i) =>
      i % 2 === 1 ? (
        <strong key={`${keyPrefix}-${i}`}>{part}</strong>
      ) : part ? (
        <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>
      ) : null
    );
}

/**
 * Renders a Markdown document as a list of styled block elements
 * (h2/h3/p/ul) ready to drop into a page.
 */
export function renderMarkdown(content: string): ReactNode[] {
  const blocks = content
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, i) => {
    const key = `block-${i}`;

    if (block.startsWith("### ")) {
      return (
        <h3
          key={key}
          className="mt-10 font-display text-2xl leading-snug text-ink"
        >
          {renderInline(block.slice(4), key)}
        </h3>
      );
    }

    if (block.startsWith("## ")) {
      return (
        <h2
          key={key}
          className="mt-12 font-display text-2xl leading-snug text-ink sm:text-3xl"
        >
          {renderInline(block.slice(3), key)}
        </h2>
      );
    }

    const lines = block.split("\n");
    if (lines.every((line) => line.startsWith("- "))) {
      return (
        <ul key={key} className="mt-6 list-disc space-y-2 ps-6 text-ink/85">
          {lines.map((line, j) => (
            <li key={`${key}-${j}`}>
              {renderInline(line.slice(2), `${key}-${j}`)}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={key} className="mt-6 leading-relaxed text-ink/85">
        {renderInline(block, key)}
      </p>
    );
  });
}