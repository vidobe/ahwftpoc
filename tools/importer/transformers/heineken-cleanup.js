/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: heineken (Adobe + Heineken PoC EDS docs site) cleanup.
 *
 * Removes non-authorable site chrome and auto-injected blocks so the import
 * contains only authored page content. All selectors verified against
 * migration-work/cleaned.html and migration-work/page-structure.json.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Interactive site-shell widgets that overlay content / block parsing.
    // Found in cleaned.html: <div class="floating-btn">, <div class="modal">, <div class="image-modal">
    WebImporter.DOMUtils.remove(element, [
      '.floating-btn',
      '.modal',
      '.image-modal',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome and auto-injected blocks.
    // Verified selectors:
    //   header.header-wrapper (cleaned.html line 2) — global nav
    //   footer.footer-wrapper (cleaned.html line 353) — global footer
    //   main > aside.left-navigation-wrapper (page-structure excludedAutoBlocks) — auto-injected nav rail
    //   main > aside.right-rail / .on-this-page-wrapper (page-structure excludedAutoBlocks) — auto-injected TOC rail
    //   div.next-button.block (cleaned.html line 331) — auto-injected "Next Chapter" button.
    //     NOTE: do NOT target '.next-button-wrapper'/'.next-button-container' — in this
    //     snapshot those container classes are merged onto the authored content section
    //     div (line 252: "section title-container tip-container note-container
    //     next-button-wrapper next-button-container"), so removing them deletes all
    //     authored content. Only the '.next-button.block' element is the auto-injected block.
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'aside.left-navigation-wrapper',
      'aside.right-rail',
      '.on-this-page-wrapper',
      'div.next-button.block',
    ]);
  }
}
