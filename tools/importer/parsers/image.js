/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: image
 * Base block: image (custom — presentational picture with width variant)
 * Source: https://main--heineken--adobe-demopoc.aem.live/gspem/...
 * Selector: .image
 *
 * Source structure: .image.width-Npercent > div > div > picture > img
 * Single-column block: one row/one cell holding the image. The width variant
 * (e.g. `width-60percent`) is preserved as a block variant so styling carries.
 */
export default function parse(element, { document }) {
  const img = element.querySelector('img');
  const picture = element.querySelector('picture');
  const media = picture || img;

  // Empty-block guard.
  if (!media) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Preserve the width variant class (width-Npercent) as a block variant.
  const widthVariant = Array.from(element.classList).find((c) => /^width-\d+percent$/.test(c));
  const name = widthVariant ? `image (${widthVariant})` : 'image';

  const cells = [[media]];

  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
