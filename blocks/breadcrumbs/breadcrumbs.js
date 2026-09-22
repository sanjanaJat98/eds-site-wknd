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

  // Collect trail items: prefer authored <li>s (imported as a list), else each
  // row's link/text. The last item is the current page (a non-linked crumb).
  let items = [...block.querySelectorAll('li')];
  if (!items.length) {
    items = [...block.children].map((row) => row.firstElementChild || row);
  }

  items.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'breadcrumbs-item';
    const link = item.querySelector('a');
    const isLast = i === items.length - 1;
    if (link && !isLast) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.trim();
      li.append(a);
    } else {
      // current page (or a non-linked crumb) — plain text
      li.textContent = (link || item).textContent.trim();
      if (isLast) li.setAttribute('aria-current', 'page');
    }
    ol.append(li);
    if (i < items.length - 1) li.classList.add('breadcrumbs-has-sep');
  });

  nav.append(ol);
  block.replaceChildren(nav);
}
