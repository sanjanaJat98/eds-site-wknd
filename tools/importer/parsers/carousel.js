/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel.
 * Base block: carousel
 * Source: https://wknd.site/us/en.html (.carousel.cmp-carousel--hero)
 * Generated: 2026-09-17
 *
 * Library convention: 2 columns, multiple rows. First row = block name.
 * Each subsequent row is one slide: cell 1 = image (mandatory),
 * cell 2 = optional text content (title / description / CTA).
 */
export default function parse(element, { document }) {
  // Each carousel slide is a .cmp-carousel__item wrapping a teaser.
  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  // Fallback: some sources expose slides directly as teasers.
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll('.cmp-teaser, [class*="teaser"]'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // Image cell (mandatory) — first cell of the row.
    const image = slide.querySelector('.cmp-teaser__image img, .cmp-image img, img');

    // Text content cell (optional) — title, description, CTA.
    const contentCell = [];
    const title = slide.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]');
    const description = slide.querySelector('.cmp-teaser__description, [class*="description"], p');
    const ctaLinks = Array.from(
      slide.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'),
    );

    if (title) contentCell.push(title);
    if (description) contentCell.push(description);
    ctaLinks.forEach((cta) => contentCell.push(cta));

    // Only emit a row for slides that have an image (mandatory per convention).
    if (image) {
      cells.push([image, contentCell]);
    }
  });

  // Empty-block guard: if no slides could be extracted, unwrap gracefully.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
