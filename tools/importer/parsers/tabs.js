/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs.
 * Base block: tabs
 * Source: https://wknd.site/us/en/adventures/climbing-new-zealand.html (.tabs.panelcontainer)
 *         also https://wknd.site/us/en/adventures.html (.tabs.panelcontainer)
 * Generated: 2026-09-17
 *
 * Library convention: 2 columns, multiple rows. First row = block name.
 * Each subsequent row is one tab: cell 1 = tab label (mandatory),
 * cell 2 = tab panel content (mandatory).
 *
 * Source markup (AEM core tabs component):
 *   .cmp-tabs > ol.cmp-tabs__tablist > li.cmp-tabs__tab  (label text)
 *   .cmp-tabs > div.cmp-tabs__tabpanel                   (panel body)
 * A tab <li> id is `...item-{itemId}-tab`; its panel id is
 * `...item-{itemId}-tabpanel`. We pair label to panel by that shared
 * item id (robust against DOM nesting quirks), falling back to order.
 */
export default function parse(element, { document }) {
  const tabs = Array.from(element.querySelectorAll('.cmp-tabs__tab, [class*="tabs__tab"]:not([class*="tabpanel"])'));
  const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel, [class*="tabpanel"]'));

  // Derive the shared item id from a tab/panel element id (…-item-{id}-tab / -tabpanel).
  const itemId = (el) => {
    const m = (el.id || '').match(/item-([^-]+)-(?:tab|tabpanel)/);
    return m ? m[1] : null;
  };

  const cells = [];

  tabs.forEach((tab, i) => {
    // Tab label — clone so we emit only the label text, not the whole li chrome.
    const label = document.createElement('div');
    label.textContent = tab.textContent.trim();

    // Match panel by shared item id, else fall back to positional order.
    const id = itemId(tab);
    let panel = id ? panels.find((p) => itemId(p) === id) : null;
    if (!panel) panel = panels[i];

    // Panel body — prefer the content fragment / inner content, else the panel itself.
    let panelContent = panel;
    if (panel) {
      const inner = panel.querySelector('.cmp-contentfragment__elements, .contentfragment, .cmp-contentfragment');
      if (inner) panelContent = inner;
    }

    if (label.textContent) {
      cells.push([label, panelContent || '']);
    }
  });

  // Empty-block guard: nothing extractable → unwrap gracefully.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
