/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-adventure-detail.js
  var import_adventure_detail_exports = {};
  __export(import_adventure_detail_exports, {
    default: () => import_adventure_detail_default
  });

  // tools/importer/parsers/breadcrumbs.js
  function parse(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(".cmp-breadcrumb__item, li"));
    const cells = [];
    items.forEach((item) => {
      const link = item.querySelector("a.cmp-breadcrumb__item-link, a");
      const isActive = item.classList.contains("cmp-breadcrumb__item--active") || item.getAttribute("aria-current") === "page";
      if (link && !isActive) {
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = link.textContent.trim();
        if (a.textContent) cells.push([a]);
      } else {
        const text = item.textContent.trim();
        if (text) {
          const span = document2.createElement("div");
          span.textContent = text;
          cells.push([span]);
        }
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "breadcrumbs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel.js
  function parse2(element, { document: document2 }) {
    let slides = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    if (!slides.length) {
      slides = Array.from(element.querySelectorAll('.cmp-teaser, [class*="teaser"]'));
    }
    const cells = [];
    slides.forEach((slide) => {
      const image = slide.querySelector(".cmp-teaser__image img, .cmp-image img, img");
      const contentCell = [];
      const title = slide.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]');
      const description = slide.querySelector('.cmp-teaser__description, [class*="description"], p');
      const ctaLinks = Array.from(
        slide.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a")
      );
      if (title) contentCell.push(title);
      if (description) contentCell.push(description);
      ctaLinks.forEach((cta) => contentCell.push(cta));
      if (image) {
        cells.push([image, contentCell]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document: document2 }) {
    const textCell = [];
    const pretitle = element.querySelector(".cmp-teaser__pretitle");
    const title = element.querySelector(".cmp-teaser__title, h1, h2, h3, h4");
    const description = element.querySelector(".cmp-teaser__description");
    const ctaLinks = Array.from(
      element.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a")
    );
    if (pretitle) textCell.push(pretitle);
    if (title) textCell.push(title);
    if (description) textCell.push(description);
    ctaLinks.forEach((cta) => textCell.push(cta));
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    if (!textCell.length && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[textCell, image || ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs.js
  function parse4(element, { document: document2 }) {
    const tabs = Array.from(element.querySelectorAll('.cmp-tabs__tab, [class*="tabs__tab"]:not([class*="tabpanel"])'));
    const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel, [class*="tabpanel"]'));
    const itemId = (el) => {
      const m = (el.id || "").match(/item-([^-]+)-(?:tab|tabpanel)/);
      return m ? m[1] : null;
    };
    const cells = [];
    tabs.forEach((tab, i) => {
      const label = document2.createElement("div");
      label.textContent = tab.textContent.trim();
      const id = itemId(tab);
      let panel = id ? panels.find((p) => itemId(p) === id) : null;
      if (!panel) panel = panels[i];
      let panelContent = panel;
      if (panel) {
        const inner = panel.querySelector(".cmp-contentfragment__elements, .contentfragment, .cmp-contentfragment");
        if (inner) panelContent = inner;
      }
      if (label.textContent) {
        cells.push([label, panelContent || ""]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#destination_publishing_iframe_wkndsite_0",
        "iframe"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.cmp-experiencefragment--header",
        "footer.cmp-experiencefragment--footer",
        "#toggleNav",
        "#mobileNav",
        ".cmp-navigation--mobile",
        "noscript"
      ]);
      element.querySelectorAll("meta").forEach((el) => el.remove());
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function resolveSections(root, sections) {
    const claimed = /* @__PURE__ */ new Set();
    const resolved = /* @__PURE__ */ new Map();
    for (const section of sections) {
      let found = null;
      for (const sel of section.selector || []) {
        const candidates = root.querySelectorAll(sel);
        for (const el of candidates) {
          if (!claimed.has(el)) {
            found = el;
            break;
          }
        }
        if (found) break;
      }
      if (found) {
        claimed.add(found);
        resolved.set(section.id, found);
      }
    }
    return resolved;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      const resolved = resolveSections(element, sections);
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = resolved.get(section.id);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      const resolved = resolveSections(element, sections);
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || resolved.get(section.id);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-adventure-detail.js
  var parsers = {
    "breadcrumbs": parse,
    "carousel": parse2,
    "columns": parse3,
    "tabs": parse4
  };
  var PAGE_TEMPLATE = {
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
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        elements.forEach((element) => pageBlocks.push({ name: blockDef.name, selector, element }));
      });
    });
    return pageBlocks;
  }
  var import_adventure_detail_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else console.warn(`No parser found for block: ${block.name}`);
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{ element: main, path, report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
    }
  };
  return __toCommonJS(import_adventure_detail_exports);
})();
