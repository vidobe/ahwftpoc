/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: title
 * Base block: title (custom — not found in library catalog, structure inferred from source HTML)
 * Source: https://main--heineken--adobe-demopoc.aem.live/overview
 * Selector: .title.heading-3
 * Generated: 2026-09-07
 *
 * Source structure: .title.heading-3.block > div > div > (h2[id] > a > strong, p)
 * Single-column block: one row whose single cell holds the heading and body copy.
 */
export default function parse(element, { document }) {
  // Heading — validated against source (<h2 id> with anchor link + <strong>).
  // Fallbacks cover other heading levels used by the heading-* variants.
  const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
  // Body copy — one or more paragraphs following the heading.
  const paragraphs = Array.from(element.querySelectorAll('p'));

  // Empty-block guard: bail gracefully if nothing meaningful was found.
  if (!heading && paragraphs.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];
  if (heading) contentCell.push(heading);
  contentCell.push(...paragraphs);

  const cells = [];
  cells.push([contentCell]); // single-column: one row, one cell holding all content

  const block = WebImporter.Blocks.createBlock(document, { name: 'title', cells });
  element.replaceWith(block);
}
