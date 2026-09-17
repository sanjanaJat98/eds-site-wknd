/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND section breaks and section metadata.
 * Driven by payload.template.sections (home-landing has 5 sections).
 *
 * Selectors come straight from page-templates.json section.selector arrays
 * (DOM-verified during page analysis against migration-work/cleaned.html).
 *
 * NOTE on duplicate selectors: sections s3 (Recent Articles) and s5 (Where do
 * you want to go) both use ".image-list.list" — there are two such elements in
 * the page (cleaned.html lines 281 and 391). A plain querySelector would
 * resolve BOTH sections to the first one. resolveSections() below claims each
 * matched element once, in document order, so s3 -> first image-list and
 * s5 -> second image-list.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// Resolve each section to a distinct element. For each section, try its
// candidate selectors in order and pick the first matching element that has
// not already been claimed by an earlier section.
function resolveSections(root, sections) {
  const claimed = new Set();
  const resolved = new Map();
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

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    const resolved = resolveSections(element, sections);
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break
      const sectionEl = resolved.get(section.id);
      if (!sectionEl) continue; // no selector matched — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Anchor each styled section's Section Metadata block to the marker <hr>
    // placed above (or, for a styled first section, the resolved element).
    const resolved = resolveSections(element, sections);
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || resolved.get(section.id);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // first section never gets a real leading break
      }
    }
  }
}
