/* eslint-disable */
/* global WebImporter */
/**
 * Parser for breadcrumbs.
 * Base block: breadcrumbs (custom — no library convention, inferred from source)
 * Source: https://wknd.site/us/en/adventures/climbing-new-zealand.html (.breadcrumb.cmp-breadcrumb--fixed)
 * Generated: 2026-09-17
 *
 * Target block (blocks/breadcrumbs/breadcrumbs.js) reads all <a> in the
 * block as ancestor links (in order) plus a trailing NON-link cell for
 * the current page. So we emit a single-column table where each ancestor
 * is its own row holding a link, and the current page is a plain-text row.
 *
 * Source markup (AEM core breadcrumb):
 *   .cmp-breadcrumb > ol.cmp-breadcrumb__list
 *     > li.cmp-breadcrumb__item          → a.cmp-breadcrumb__item-link (ancestor)
 *     > li.cmp-breadcrumb__item--active   → span only, no link (current page)
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-breadcrumb__item, li'));

  const cells = [];

  items.forEach((item) => {
    const link = item.querySelector('a.cmp-breadcrumb__item-link, a');
    const isActive = item.classList.contains('cmp-breadcrumb__item--active')
      || item.getAttribute('aria-current') === 'page';

    if (link && !isActive) {
      // Ancestor link — normalise to an <a> carrying the label text + href.
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.trim();
      if (a.textContent) cells.push([a]);
    } else {
      // Current page (active item, or any item without a link) — plain text.
      const text = item.textContent.trim();
      if (text) {
        const span = document.createElement('div');
        span.textContent = text;
        cells.push([span]);
      }
    }
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumbs', cells });
  element.replaceWith(block);
}
