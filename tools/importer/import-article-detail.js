/* eslint-disable */
/* global WebImporter */

import heroParser from "./parsers/hero.js";
import breadcrumbsParser from "./parsers/breadcrumbs.js";

import cleanupTransformer from "./transformers/wknd-cleanup.js";
import sectionsTransformer from "./transformers/wknd-sections.js";

const parsers = {
  "hero": heroParser,
  "breadcrumbs": breadcrumbsParser,
};

const PAGE_TEMPLATE = {
    "name": "article-detail",
    "description": "Editorial article page: hero, breadcrumbs, pull quote and stacked text and image content",
    "urls": [
      "https://wknd.site/ca/en/magazine/arctic-surfing.html",
      "https://wknd.site/ca/en/magazine/guide-la-skateparks.html",
      "https://wknd.site/ca/en/magazine/members-only/alaskan-adventure.html",
      "https://wknd.site/ca/en/magazine/members-only/fly-fishing-the-amazon.html",
      "https://wknd.site/ca/en/magazine/san-diego-surf.html",
      "https://wknd.site/ca/en/magazine/ski-touring.html",
      "https://wknd.site/ca/en/magazine/western-australia.html",
      "https://wknd.site/us/en/magazine/arctic-surfing.html",
      "https://wknd.site/us/en/magazine/guide-la-skateparks.html",
      "https://wknd.site/us/en/magazine/san-diego-surf.html",
      "https://wknd.site/us/en/magazine/ski-touring.html",
      "https://wknd.site/us/en/magazine/western-australia.html"
    ],
    "blocks": [
      {
        "name": "hero",
        "instances": [
          ".cmp-layout-container--fixed > .cmp-container > .aem-Grid > .image"
        ]
      },
      {
        "name": "breadcrumbs",
        "instances": [
          ".breadcrumb"
        ]
      }
    ],
    "sections": [
      {
        "id": "s1",
        "name": "Hero banner",
        "selector": [
          ".cmp-layout-container--fixed > .cmp-container > .aem-Grid > .image"
        ],
        "style": null,
        "blocks": [
          "hero"
        ],
        "defaultContent": []
      },
      {
        "id": "s2",
        "name": "Breadcrumbs",
        "selector": [
          ".breadcrumb"
        ],
        "style": null,
        "blocks": [
          "breadcrumbs"
        ],
        "defaultContent": []
      },
      {
        "id": "s3",
        "name": "Article body",
        "selector": [
          ".contentfragment"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".contentfragment"
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
  transformers.forEach((fn) => { try { fn.call(null, hookName, element, enhancedPayload); } catch (e) { console.error(`Transformer failed at ${hookName}:`, e); } });
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
      if (parser) { try { parser(block.element, { document, url, params }); } catch (e) { console.error(`Failed to parse ${block.name}:`, e); } }
      else console.warn(`No parser for: ${block.name}`);
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
