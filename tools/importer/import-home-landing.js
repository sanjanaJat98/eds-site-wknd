/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselParser from './parsers/carousel.js';
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';
import heroParser from './parsers/hero.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  carousel: carouselParser,
  columns: columnsParser,
  cards: cardsParser,
  hero: heroParser,
};

// PAGE TEMPLATE CONFIGURATION - embedded from page-templates.json (home-landing)
const PAGE_TEMPLATE = {
  name: 'home-landing',
  description: 'Locale landing/home page: full-width carousel and hero banners with a cards feature grid',
  urls: [
    'https://wknd.site/us/en.html',
  ],
  blocks: [
    { name: 'carousel', instances: ['.carousel.cmp-carousel--hero'] },
    { name: 'columns', instances: ['.teaser.cmp-teaser--featured'] },
    { name: 'cards', instances: ['.image-list.list'] },
    { name: 'hero', instances: ['.teaser.cmp-teaser--hero.cmp-teaser--imagebottom'] },
  ],
  sections: [
    { id: 's1', name: 'Hero carousel', selector: ['.carousel.cmp-carousel--hero'], style: null, blocks: ['carousel'], defaultContent: [] },
    { id: 's2', name: 'Featured Article', selector: ['.teaser.cmp-teaser--featured'], style: 'grey', blocks: ['columns'], defaultContent: [] },
    { id: 's3', name: 'Recent Articles', selector: ['.image-list.list'], style: null, blocks: ['cards'], defaultContent: ['.title.cmp-title--underline'] },
    { id: 's4', name: 'Next Adventures', selector: ['.teaser.cmp-teaser--hero.cmp-teaser--imagebottom'], style: null, blocks: ['hero'], defaultContent: ['.title.cmp-title--underline'] },
    { id: 's5', name: 'Where do you want to go', selector: ['.image-list.list'], style: null, blocks: ['cards'], defaultContent: ['.title'] },
  ],
};

// TRANSFORMER REGISTRY - cleanup first; section transformer runs when 2+ sections
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all block instances on the page based on the embedded template.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. discover blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. parse each block; skip elements already detached by a prior parser
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. built-in importer rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. sanitized path (map root URL to /index to avoid empty-path crash)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
