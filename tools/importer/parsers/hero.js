/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero.
 * Base block: hero
 * Source: https://wknd.site/us/en.html (.teaser.cmp-teaser--hero.cmp-teaser--imagebottom)
 * Generated: 2026-09-17
 *
 * Library convention: 1 column, up to 3 rows. First row = block name.
 * Row 2 (single cell) = background image (optional).
 * Row 3 (single cell) = title (heading) + subheading + CTA (optional).
 */
export default function parse(element, { document }) {
  // Background image row (optional).
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Content row: title, description, CTA — kept mutually exclusive.
  const title = element.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
  const description = element.querySelector('.cmp-teaser__description');
  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'),
  );

  const contentCell = [];
  if (title) contentCell.push(title);
  if (description) contentCell.push(description);
  ctaLinks.forEach((cta) => contentCell.push(cta));

  // Empty-block guard: bail if there is no meaningful content.
  if (!image && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single-column block: each row has exactly one cell.
  const cells = [];
  if (image) cells.push([image]); // background image row
  cells.push([contentCell]); // content row (one cell holding all elements)

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
