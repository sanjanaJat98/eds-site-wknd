/* eslint-disable */
/* global WebImporter */

import columnsParser from "./parsers/columns.js";
import cardsParser from "./parsers/cards.js";

import cleanupTransformer from "./transformers/wknd-cleanup.js";
import sectionsTransformer from "./transformers/wknd-sections.js";

const parsers = {
  "columns": columnsParser,
  "cards": cardsParser,
};

const PAGE_TEMPLATE = {
    "name": "magazine-listing",
    "description": "Magazine landing: featured article teaser + article card grids",
    "urls": [
      "https://wknd.site/us/en/magazine.html"
    ],
    "blocks": [
      {
        "name": "columns",
        "instances": [
          ".teaser.cmp-teaser--featured"
        ]
      },
      {
        "name": "cards",
        "instances": [
          ".image-list.list, .teaser.cmp-teaser--list"
        ]
      }
    ],
    "sections": [
      {
        "id": "s1",
        "name": "Featured article",
        "selector": [
          ".teaser.cmp-teaser--featured"
        ],
        "style": null,
        "blocks": [
          "columns"
        ],
        "defaultContent": [
          ".title"
        ]
      },
      {
        "id": "s2",
        "name": "All Articles",
        "selector": [
          ".image-list.list"
        ],
        "style": null,
        "blocks": [
          "cards"
        ],
        "defaultContent": [
          ".title.cmp-title--underline"
        ]
      },
      {
        "id": "s3",
        "name": "Members Only",
        "selector": [
          ".teaser.cmp-teaser--list"
        ],
        "style": null,
        "blocks": [
          "cards"
        ],
        "defaultContent": [
          ".title"
        ]
      }
    ]
  };

const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn.call(null, hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      elements.forEach((element) => pageBlocks.push({ name: blockDef.name, selector, element }));
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;
    executeTransformers("beforeTransform", main, payload);
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try { parser(block.element, { document, url, params }); }
        catch (e) { console.error(`Failed to parse ${block.name}:`, e); }
      } else console.warn(`No parser for: ${block.name}`);
    });
    executeTransformers("afterTransform", main, payload);
    const hr = document.createElement("hr");
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
    const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};
