// WKND header: brand logo, primary nav, locale switcher, search.
// Content (logo, nav links, locales) lives in /content/nav.plain.html.
// This script reads that DOM and builds the interactive controls
// (search, locale toggle, mobile menu).

const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Loads the nav fragment (metadata-independent dual-fetch:
 * /content first for localhost, then root for DA/EDS production).
 */
async function loadNavFragment() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp;
}

export default async function decorate(block) {
  const frag = await loadNavFragment();
  block.textContent = '';
  if (!frag) return;

  const sections = [...frag.querySelectorAll(':scope > div')];
  const [brandSection, navSection, utilitySection, localeSection] = sections;

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  // --- Mobile hamburger ---
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = '<button type="button" aria-controls="nav" aria-expanded="false" aria-label="Open navigation"><span class="nav-hamburger-icon"></span></button>';
  const hamburgerBtn = hamburger.querySelector('button');
  hamburgerBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    hamburgerBtn.setAttribute('aria-expanded', String(open));
    hamburgerBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
  });

  // --- Brand / logo ---
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandSection) brand.append(...brandSection.childNodes);

  // --- Primary nav links ---
  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  if (navSection) {
    const ul = navSection.querySelector('ul');
    if (ul) navSections.append(ul);
  }

  // --- Tools: sign-in + locale switcher + search ---
  const tools = document.createElement('div');
  tools.className = 'nav-tools';

  if (utilitySection) {
    const utilUl = utilitySection.querySelector('ul');
    if (utilUl) {
      const utility = document.createElement('div');
      utility.className = 'nav-utility';
      utility.append(...utilUl.querySelectorAll('li a'));
      tools.append(utility);
    }
  }

  if (localeSection) {
    const localeUl = localeSection.querySelector('ul');
    if (localeUl) {
      const locale = document.createElement('div');
      locale.className = 'nav-locale';

      const currentEl = localeUl.querySelector('li a');
      const currentLabel = currentEl ? currentEl.textContent.trim() : 'en-US';

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'nav-locale-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-haspopup', 'true');
      toggle.textContent = currentLabel;

      const menu = document.createElement('ul');
      menu.className = 'nav-locale-menu';
      menu.hidden = true;
      menu.append(...localeUl.querySelectorAll('li'));

      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        menu.hidden = open;
      });
      document.addEventListener('click', (e) => {
        if (!locale.contains(e.target)) {
          toggle.setAttribute('aria-expanded', 'false');
          menu.hidden = true;
        }
      });

      locale.append(toggle, menu);
      tools.append(locale);
    }
  }

  const search = document.createElement('form');
  search.className = 'nav-search';
  search.setAttribute('role', 'search');
  search.action = '/us/en/search.html';
  search.innerHTML = '<input type="search" name="q" aria-label="Search" placeholder="Search">';
  tools.append(search);

  nav.append(hamburger, brand, navSections, tools);
  navWrapper.append(nav);
  block.append(navWrapper);

  // Reset mobile menu when resizing up to desktop
  isDesktop.addEventListener('change', () => {
    if (isDesktop.matches) {
      nav.classList.remove('nav-open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      hamburgerBtn.setAttribute('aria-label', 'Open navigation');
      document.body.style.overflowY = '';
    }
  });
}
