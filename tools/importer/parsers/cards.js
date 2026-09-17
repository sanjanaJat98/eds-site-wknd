/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards.
 * Base block: cards
 * Source: https://wknd.site/us/en.html (.image-list.list)
 * Generated: 2026-09-17
 *
 * Library convention: 2 columns, multiple rows. First row = block name.
 * Each subsequent row is one card: cell 1 = image (mandatory),
 * cell 2 = text content (title, description, optional CTA).
 */
export default function parse(element, { document }) {
  // Each card is a list item in the image list.
  let items = Array.from(element.querySelectorAll('.cmp-image-list__item'));
  // Fallback: generic list items or article wrappers.
  if (!items.length) {
    items = Array.from(element.querySelectorAll('li, article, [class*="item"]'));
  }

  const cells = [];

  items.forEach((item) => {
    // Image cell (mandatory) — first cell of the row.
    const image = item.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');

    // Text content cell — title, description, CTA.
    const bodyCell = [];

    // Title: prefer the semantic title text; wrap in a link if the card is linked.
    const titleText = item.querySelector('.cmp-image-list__item-title');
    const titleLink = item.querySelector('.cmp-image-list__item-title-link');
    if (titleText) {
      bodyCell.push(titleText);
    } else if (titleLink) {
      bodyCell.push(titleLink);
    }

    const description = item.querySelector('.cmp-image-list__item-description, [class*="description"]');
    if (description) bodyCell.push(description);

    // Optional standalone CTA (not the image/title wrapping links).
    const cta = item.querySelector('.cmp-image-list__item-cta a, a[class*="cta"]');
    if (cta) bodyCell.push(cta);

    // Emit a row only if the card has an image (mandatory per convention).
    if (image) {
      cells.push([image, bodyCell]);
    }
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
