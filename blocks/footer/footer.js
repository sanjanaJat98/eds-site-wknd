// WKND footer: light logo, footer nav, "Follow Us" social links, copyright + attribution.
// Content lives in /content/footer.plain.html. This script reads that DOM and labels
// the sections so footer.css can lay them out.

/**
 * Loads the footer fragment (metadata-independent dual-fetch:
 * /content first for localhost, then root for DA/EDS production).
 */
async function loadFooterFragment() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp;
}

export default async function decorate(block) {
  const frag = await loadFooterFragment();
  block.textContent = '';
  if (!frag) return;

  const sections = [...frag.querySelectorAll(':scope > div')];
  const [brandSection, navSection, socialSection, legalSection] = sections;

  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  if (brandSection) {
    brandSection.classList.add('footer-brand');
    footer.append(brandSection);
  }
  if (navSection) {
    navSection.classList.add('footer-nav');
    footer.append(navSection);
  }
  if (socialSection) {
    socialSection.classList.add('footer-social');
    footer.append(socialSection);
  }
  if (legalSection) {
    legalSection.classList.add('footer-legal');
    footer.append(legalSection);
  }

  block.append(footer);
}
