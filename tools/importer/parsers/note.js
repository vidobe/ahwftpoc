/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: note
 * Base block: note (custom — not found in library catalog, structure inferred from source HTML)
 * Source: https://main--heineken--adobe-demopoc.aem.live/overview
 * Selector: .note
 * Generated: 2026-09-07
 *
 * Source structure: .note.block > div (label: p > span.icon + <strong>NOTE</strong>)
 *                               > div (body: div > p)
 * Single-column callout with two rows: label row, then body content row.
 */
export default function parse(element, { document }) {
  // Top-level rows of the block (direct children of the block element).
  const rowDivs = Array.from(element.querySelectorAll(':scope > div'));

  // Label row — contains the icon and the note label (e.g. "NOTE").
  const labelRow = rowDivs[0];
  // Body row — the remaining content paragraphs.
  const bodyRow = rowDivs[1];

  const labelEl = labelRow ? labelRow.querySelector('p, strong') : null;
  const bodyParagraphs = bodyRow ? Array.from(bodyRow.querySelectorAll('p')) : [];

  // Empty-block guard.
  if (!labelEl && bodyParagraphs.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Row 1: label (icon + text)
  if (labelEl) cells.push([labelEl]);
  // Row 2: body copy
  if (bodyParagraphs.length) cells.push([bodyParagraphs]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'note', cells });
  element.replaceWith(block);
}
