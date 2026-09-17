/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns.
 * Base block: columns
 * Source: https://wknd.site/us/en.html (.teaser.cmp-teaser--featured)
 * Generated: 2026-09-17
 *
 * Library convention: multiple columns/rows; first row = block name.
 * Each cell becomes a column. This featured teaser is a side-by-side
 * layout: a text column (eyebrow, heading, paragraph, CTA) and an
 * image column. Natural grouping = 2 columns in a single content row.
 */
export default function parse(element, { document }) {
  // Text column content (eyebrow / heading / description / CTA).
  // Selectors are kept mutually exclusive so a single node is not
  // matched by more than one query (e.g. "pretitle" contains "title").
  const textCell = [];
  const pretitle = element.querySelector('.cmp-teaser__pretitle');
  const title = element.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
  const description = element.querySelector('.cmp-teaser__description');
  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'),
  );

  if (pretitle) textCell.push(pretitle);
  if (title) textCell.push(title);
  if (description) textCell.push(description);
  ctaLinks.forEach((cta) => textCell.push(cta));

  // Image column.
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Empty-block guard: bail if there is no meaningful content.
  if (!textCell.length && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single content row with two columns: text cell + image cell.
  const cells = [[textCell, image || '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
