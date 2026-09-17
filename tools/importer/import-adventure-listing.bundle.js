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

  // tools/importer/import-adventure-listing.js
  var import_adventure_listing_exports = {};
  __export(import_adventure_listing_exports, {
    default: () => import_adventure_listing_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    const title = element.querySelector(".cmp-teaser__title, h1, h2, h3, h4");
    const description = element.querySelector(".cmp-teaser__description");
    const ctaLinks = Array.from(
      element.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a")
    );
    const contentCell = [];
    if (title) contentCell.push(title);
    if (description) contentCell.push(description);
    ctaLinks.forEach((cta) => contentCell.push(cta));
    if (!image && !contentCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) cells.push([image]);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs.js
  function parse2(element, { document: document2 }) {
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

  // tools/importer/import-adventure-listing.js
  var parsers = {
    "hero": parse,
    "tabs": parse2
  };
  var PAGE_TEMPLATE = {
    "name": "adventure-listing",
    "description": "Listing page: hero banner followed by a tabbed grid of linked child items",
    "urls": [
      "https://wknd.site/ca/en/adventures.html",
      "https://wknd.site/us/en/adventures.html"
    ],
    "blocks": [
      {
        "name": "hero",
        "instances": [
          ".teaser.cmp-teaser--hero"
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
        "name": "Intro hero",
        "selector": [
          ".teaser.cmp-teaser--hero"
        ],
        "style": null,
        "blocks": [
          "hero"
        ],
        "defaultContent": [
          ".title"
        ]
      },
      {
        "id": "s2",
        "name": "Current Adventures",
        "selector": [
          ".tabs.panelcontainer"
        ],
        "style": null,
        "blocks": [
          "tabs"
        ],
        "defaultContent": [
          ".title.cmp-title--underline"
        ]
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
  var import_adventure_listing_default = {
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
  return __toCommonJS(import_adventure_listing_exports);
})();
