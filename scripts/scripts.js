import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // <strong>/<em> wrapping selects an explicit variant; otherwise a link that
    // is the sole content of its paragraph is promoted to a primary button
    // (WKND CTA convention — "View Trips", "Full Article", etc.).
    const strong = a.closest('strong');
    const em = a.closest('em');

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else if (em) {
      a.classList.add('secondary');
      em.replaceWith(a);
    } else {
      a.classList.add('primary');
    }
  });
}

// Inline SVGs for the boxed social-icon buttons used by the About Us
// contributor cards (dark square, white glyph — matches the WKND source).
const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.87.24-1.46 1.49-1.46H17V3.96A20 20 0 0 0 14.68 3.84c-2.3 0-3.88 1.4-3.88 3.98V10H8.1v3h2.7v8z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M22 5.9c-.7.32-1.5.53-2.3.63a4 4 0 0 0 1.77-2.22 8 8 0 0 1-2.55.98A4 4 0 0 0 11.9 9a11.4 11.4 0 0 1-8.28-4.2 4 4 0 0 0 1.25 5.36c-.65-.02-1.26-.2-1.8-.5v.05a4 4 0 0 0 3.22 3.94c-.6.16-1.23.18-1.82.07a4 4 0 0 0 3.74 2.78A8.05 8.05 0 0 1 2 18.13a11.35 11.35 0 0 0 6.16 1.8c7.39 0 11.43-6.12 11.43-11.43v-.52A8.2 8.2 0 0 0 22 5.9z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.44c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.24-2.19.41-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.17.42-.36 1.04-.41 2.19-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.24 1.77.41 2.19.21.55.47.94.88 1.35.41.41.8.67 1.35.88.42.17 1.04.36 2.19.41 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.24 2.19-.41.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.17-.42.36-1.04.41-2.19.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.24-1.77-.41-2.19a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.42-.17-1.04-.36-2.19-.41-1.24-.06-1.61-.07-4.76-.07zm0 3.68a4.72 4.72 0 1 0 0 9.44 4.72 4.72 0 0 0 0-9.44zm0 7.79a3.07 3.07 0 1 1 0-6.14 3.07 3.07 0 0 1 0 6.14zm6.01-7.98a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z"/></svg>',
};

/**
 * Convert a Facebook/Twitter/Instagram text link into a dark boxed social-icon
 * button. Matches on the link's title/text; no-ops for other links.
 * @param {HTMLAnchorElement} a The social link
 * @returns {string|null} The matched network key, or null if not a social link
 */
function toBoxedSocialIcon(a) {
  const label = (a.getAttribute('title') || a.textContent).trim();
  const key = Object.keys(SOCIAL_ICONS).find((k) => new RegExp(k, 'i').test(label));
  if (!key) return null;
  a.className = `article-social-icon article-social-icon--${key}`;
  a.setAttribute('aria-label', label);
  a.innerHTML = SOCIAL_ICONS[key];
  return key;
}

/**
 * On the About Us page the contributors are authored as a flat run of elements
 * inside one content wrapper: an <h2> divider ("Our Contributors" / "WKND
 * Guides"), an intro <p>, then per person a photo <p>, a name <h3>, a role <h5>
 * and three social-link <p>s. Group each person's run into a .contributor-card
 * and collect the cards after each <h2> into a .contributors-grid. No-ops when
 * the "Our Contributors" heading is absent (every other page).
 * @param {Element} main The main element
 */
function decorateContributors(main) {
  const wrapper = [...main.querySelectorAll('.default-content-wrapper')].find((w) => [...w.querySelectorAll('h2')].some((h) => /our contributors/i.test(h.textContent)));
  if (!wrapper) return;
  wrapper.closest('.section')?.classList.add('about-contributors');

  const children = [...wrapper.children];
  let grid = null;
  let card = null;

  children.forEach((el) => {
    const isPhoto = el.tagName === 'P' && el.querySelector('picture, img');

    if (el.tagName === 'H2') {
      // section divider — the following people form a fresh grid
      grid = null;
      card = null;
      return;
    }

    if (isPhoto) {
      // start a new card, opening a grid if needed
      if (!grid) {
        grid = document.createElement('div');
        grid.className = 'contributors-grid';
        el.before(grid);
      }
      card = document.createElement('div');
      card.className = 'contributor-card';
      grid.append(card);
      el.classList.add('contributor-photo');
      card.append(el);
      return;
    }

    // not a photo and not a divider: belongs to the current card if one is open
    if (card) {
      if (el.tagName === 'H3') el.classList.add('contributor-name');
      if (el.tagName === 'H5') el.classList.add('contributor-role');
      const link = el.tagName === 'P' ? el.querySelector('a') : null;
      if (link && toBoxedSocialIcon(link)) el.classList.add('contributor-social');
      card.append(el);
    }
  });

  // group each card's social paragraphs into one row for horizontal layout
  wrapper.querySelectorAll('.contributor-card').forEach((c) => {
    const socials = [...c.querySelectorAll(':scope > .contributor-social')];
    if (!socials.length) return;
    const row = document.createElement('div');
    row.className = 'contributor-socials';
    socials[0].before(row);
    socials.forEach((p) => row.append(p.querySelector('a') || p));
    socials.forEach((p) => p.remove());
  });
}

/**
 * On adventure-detail pages, wrap any image paragraph's trailing text in a
 * .adventure-caption span so it renders as the source's small uppercase caption
 * below the image (instead of inline beside it). No-ops elsewhere.
 * @param {Element} main The main element
 */
function decorateAdventureCaption(main) {
  const section = main.querySelector('.section.carousel-container.tabs-container');
  if (!section) return;
  section.querySelectorAll('p').forEach((p) => {
    if (!p.querySelector('picture, img')) return;
    if (p.querySelector('.adventure-caption')) return;
    [...p.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const span = document.createElement('span');
        span.className = 'adventure-caption';
        span.textContent = node.textContent.trim();
        node.replaceWith(span);
      }
    });
  });
}

/**
 * On adventure-detail pages, pair the metadata sidebar (default-content-wrapper
 * with the trip-stats list) and the tabbed content into one two-column row so
 * their tops align, and lift the title into a full-width wrapper below the hero.
 * No-ops elsewhere.
 * @param {Element} main The main element
 */
function decorateAdventureLayout(main) {
  const section = main.querySelector('.section.carousel-container.tabs-container');
  if (!section) return;
  const dcw = section.querySelector(':scope > .default-content-wrapper');
  const tabsWrapper = section.querySelector(':scope > .tabs-wrapper');
  if (!dcw || section.querySelector(':scope > .adventure-columns')) return;

  // lift the title out into a full-width wrapper below the hero
  const h1 = dcw.querySelector(':scope > h1');
  if (h1) {
    const titleWrapper = document.createElement('div');
    titleWrapper.className = 'adventure-title-wrapper';
    titleWrapper.append(h1);
    dcw.before(titleWrapper);
  }

  // pair the metadata sidebar and the tabs into one two-column row
  if (tabsWrapper) {
    const columns = document.createElement('div');
    columns.className = 'adventure-columns';
    dcw.before(columns);
    columns.append(dcw, tabsWrapper);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
  decorateAdventureCaption(main);
  decorateAdventureLayout(main);
  decorateContributors(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('body > header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('body > footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  import('./consent-check.js');
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
