/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: tip
 * Base block: tip (custom — not found in library catalog, structure inferred from source HTML)
 * Source: https://main--heineken--adobe-demopoc.aem.live/overview
 * Selector: .tip
 * Generated: 2026-09-07
 *
 * Source structure: .tip.block > div (label: p > span.icon + <strong>Quick Tip</strong>)
 *                              > div (body: div > p, p)
 * Single-column callout with two rows: label row, then body content row.
 */
export default function parse(element, { document }) {
  // Top-level rows of the block (direct children of the block element).
  const rowDivs = Array.from(element.querySelectorAll(':scope > div'));

  // Label row — contains the icon and the tip label (e.g. "Quick Tip").
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'tip', cells });
  element.replaceWith(block);
}
