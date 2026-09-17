/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import breadcrumbsParser from "./parsers/breadcrumbs.js";
import carouselParser from "./parsers/carousel.js";
import columnsParser from "./parsers/columns.js";
import tabsParser from "./parsers/tabs.js";

// TRANSFORMER IMPORTS
import cleanupTransformer from "./transformers/wknd-cleanup.js";
import sectionsTransformer from "./transformers/wknd-sections.js";

// PARSER REGISTRY
const parsers = {
  "breadcrumbs": breadcrumbsParser,
  "carousel": carouselParser,
  "columns": columnsParser,
  "tabs": tabsParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
    "name": "adventure-detail",
    "description": "Detail page: breadcrumbs, image carousel and a tabbed content block with itinerary/details",
    "urls": [
      "https://wknd.site/ca/en/adventures/bali-surf-camp.html",
      "https://wknd.site/ca/en/adventures/beervana-portland.html",
      "https://wknd.site/ca/en/adventures/climbing-new-zealand.html",
      "https://wknd.site/ca/en/adventures/colorado-rock-climbing.html",
      "https://wknd.site/ca/en/adventures/cycling-southern-utah.html",
      "https://wknd.site/ca/en/adventures/cycling-tuscany.html",
      "https://wknd.site/ca/en/adventures/downhill-skiing-wyoming.html",
      "https://wknd.site/ca/en/adventures/gastronomic-marais-tour.html",
      "https://wknd.site/ca/en/adventures/napa-wine-tasting.html",
      "https://wknd.site/ca/en/adventures/riverside-camping-australia.html",
      "https://wknd.site/ca/en/adventures/ski-touring-mont-blanc.html",
      "https://wknd.site/ca/en/adventures/surf-camp-costa-rica.html",
      "https://wknd.site/ca/en/adventures/tahoe-skiing.html",
      "https://wknd.site/ca/en/adventures/west-coast-cycling.html",
      "https://wknd.site/ca/en/adventures/whistler-mountain-biking.html",
      "https://wknd.site/ca/en/adventures/yosemite-backpacking.html",
      "https://wknd.site/us/en/adventures/bali-surf-camp.html",
      "https://wknd.site/us/en/adventures/beervana-portland.html",
      "https://wknd.site/us/en/adventures/climbing-new-zealand.html",
      "https://wknd.site/us/en/adventures/colorado-rock-climbing.html",
      "https://wknd.site/us/en/adventures/cycling-southern-utah.html",
      "https://wknd.site/us/en/adventures/cycling-tuscany.html",
      "https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html",
      "https://wknd.site/us/en/adventures/gastronomic-marais-tour.html",
      "https://wknd.site/us/en/adventures/napa-wine-tasting.html",
      "https://wknd.site/us/en/adventures/riverside-camping-australia.html",
      "https://wknd.site/us/en/adventures/ski-touring-mont-blanc.html",
      "https://wknd.site/us/en/adventures/surf-camp-costa-rica.html",
      "https://wknd.site/us/en/adventures/tahoe-skiing.html",
      "https://wknd.site/us/en/adventures/west-coast-cycling.html",
      "https://wknd.site/us/en/adventures/whistler-mountain-biking.html",
      "https://wknd.site/us/en/adventures/yosemite-backpacking.html"
    ],
    "blocks": [
      {
        "name": "breadcrumbs",
        "instances": [
          ".breadcrumb.cmp-breadcrumb--fixed"
        ]
      },
      {
        "name": "carousel",
        "instances": [
          ".carousel.cmp-carousel--mini"
        ]
      },
      {
        "name": "columns",
        "instances": [
          ".contentfragment.cmp-contentfragment--elements"
        ]
      },
      {
        "name": "tabs",
        "instances": [
          ".tabs.panelcontainer"
        ]
      }
    ],
    "sections": [
      {
        "id": "s1",
        "name": "Breadcrumbs",
        "selector": [
          ".breadcrumb.cmp-breadcrumb--fixed"
        ],
        "style": null,
        "blocks": [
          "breadcrumbs"
        ],
        "defaultContent": []
      },
      {
        "id": "s2",
        "name": "Image carousel",
        "selector": [
          ".carousel.cmp-carousel--mini"
        ],
        "style": null,
        "blocks": [
          "carousel"
        ],
        "defaultContent": []
      },
      {
        "id": "s3",
        "name": "Adventure title",
        "selector": [
          ".title.cmp-title--underline"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".title.cmp-title--underline"
        ]
      },
      {
        "id": "s4",
        "name": "Adventure details",
        "selector": [
          ".contentfragment.cmp-contentfragment--elements"
        ],
        "style": null,
        "blocks": [
          "columns"
        ],
        "defaultContent": []
      },
      {
        "id": "s5",
        "name": "Tabbed content",
        "selector": [
          ".tabs.panelcontainer"
        ],
        "style": null,
        "blocks": [
          "tabs"
        ],
        "defaultContent": []
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
        catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
      } else console.warn(`No parser found for block: ${block.name}`);
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
