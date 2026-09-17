/* eslint-disable */
/* global WebImporter */

import cardsParser from "./parsers/cards.js";

import cleanupTransformer from "./transformers/wknd-cleanup.js";
import sectionsTransformer from "./transformers/wknd-sections.js";

const parsers = {
  "cards": cardsParser,
};

const PAGE_TEMPLATE = {
    "name": "content-hub",
    "description": "Section hub/about page: stacked hero banners with intro text and teaser content blocks",
    "urls": [
      "https://wknd.site/ca/en/about-us.html",
      "https://wknd.site/ca/en/magazine.html",
      "https://wknd.site/ca/en/magazine/members-only.html",
      "https://wknd.site/us/en/about-us.html",
      "https://wknd.site/us/en/magazine.html"
    ],
    "blocks": [
      {
        "name": "cards",
        "instances": [
          ".experiencefragment.cmp-experience-fragment--contributor"
        ]
      }
    ],
    "sections": [
      {
        "id": "s1",
        "name": "Contributors + Guides",
        "selector": [
          ".cmp-experience-fragment--contributor"
        ],
        "style": null,
        "blocks": [
          "cards"
        ],
        "defaultContent": [
          ".cmp-title__text"
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
