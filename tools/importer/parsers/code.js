/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: code
 * Base block: code (custom — syntax-highlighted snippet with copy button)
 * Source: https://main--heineken--adobe-demopoc.aem.live/gspem/create/create-ad
 * Selector: .code
 *
 * Source structure: .code.language-* > div > div > pre > code
 * Single-column block: one row/one cell holding the <pre><code>. The
 * `language-*` variant is preserved so Prism highlights the right language.
 */
export default function parse(element, { document }) {
  const pre = element.querySelector('pre');
  const code = element.querySelector('code');
  const content = pre || code;

  // Empty-block guard.
  if (!content) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Preserve the language-* variant class so the code block re-applies it.
  const langVariant = Array.from(element.classList).find((c) => /^language-/.test(c));
  const name = langVariant ? `code (${langVariant})` : 'code';

  const cells = [[content]];

  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
