/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion.
 * Base block: accordion
 * Source: https://wknd.site/us/en/faqs.html (.accordion.panelcontainer)
 * Generated: 2026-09-17
 *
 * Library convention: 2 columns, multiple rows. First row = block name.
 * Each subsequent row is one accordion item:
 *   cell 1 = title / label (mandatory),
 *   cell 2 = body content (mandatory).
 *
 * Source markup (AEM core accordion):
 *   .cmp-accordion > .cmp-accordion__item
 *       > h3.cmp-accordion__header > button > span.cmp-accordion__title  (title)
 *       > .cmp-accordion__panel                                          (body)
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-accordion__item, [class*="accordion__item"]'));

  const cells = [];

  items.forEach((item) => {
    // Title — prefer the dedicated title span, else the header/button text.
    const titleEl = item.querySelector('.cmp-accordion__title, .cmp-accordion__header, [class*="accordion__title"]');
    const title = document.createElement('div');
    title.textContent = (titleEl ? titleEl.textContent : '').trim();

    // Body — the panel content. Prefer inner text/container, else the panel itself.
    const panel = item.querySelector('.cmp-accordion__panel, [class*="accordion__panel"]');
    let body = panel;
    if (panel) {
      const inner = panel.querySelector('.cmp-text, .text, .cmp-container, .container');
      if (inner) body = inner;
    }

    if (title.textContent) {
      cells.push([title, body || '']);
    }
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
