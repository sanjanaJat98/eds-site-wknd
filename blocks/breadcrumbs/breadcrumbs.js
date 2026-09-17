/*
 * Breadcrumbs block
 * Renders a trail of ancestor links ending in the current page.
 * Content is a set of rows/links (from the imported table); the last
 * entry (or a non-link cell) is treated as the current page.
 */

export default function decorate(block) {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');
  ol.className = 'breadcrumbs-list';

  // Collect breadcrumb entries: any links in the block, in order,
  // plus a trailing non-link entry for the current page if present.
  const entries = [];
  block.querySelectorAll('a').forEach((a) => {
    entries.push({ label: a.textContent.trim(), href: a.getAttribute('href') });
  });

  // The current page is the last cell's text when it isn't a link.
  const cells = [...block.querySelectorAll(':scope > div > div, :scope > div')];
  const lastCell = cells[cells.length - 1];
  if (lastCell && !lastCell.querySelector('a')) {
    const text = lastCell.textContent.trim();
    if (text) entries.push({ label: text, href: null });
  }

  entries.forEach((entry, i) => {
    const li = document.createElement('li');
    li.className = 'breadcrumbs-item';
    if (entry.href) {
      const a = document.createElement('a');
      a.href = entry.href;
      a.textContent = entry.label;
      li.append(a);
    } else {
      li.textContent = entry.label;
      li.setAttribute('aria-current', 'page');
    }
    ol.append(li);
    if (i < entries.length - 1) li.classList.add('breadcrumbs-has-sep');
  });

  nav.append(ol);
  block.replaceChildren(nav);
}
