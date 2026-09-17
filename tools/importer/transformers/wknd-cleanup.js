/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 * Removes non-authorable AEM Core Components chrome so only page-level
 * authorable content remains. All selectors verified against
 * migration-work/cleaned.html (AEM Core Components markup).
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Tracking / sync iframe (cleaned.html line 566) — remove before parsing so
    // it never gets picked up as content.
    WebImporter.DOMUtils.remove(element, [
      '#destination_publishing_iframe_wkndsite_0',
      'iframe',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site shell / chrome (verified in cleaned.html):
    // - header experience fragment (line 5): sign-in buttons, language nav, logo, main nav, search
    // - footer experience fragment (line 471): footer logo, footer nav, follow-us, copyright
    // - mobile nav toggle (line 568) and mobile nav overlay (line 574)
    WebImporter.DOMUtils.remove(element, [
      'header.cmp-experiencefragment--header',
      'footer.cmp-experiencefragment--footer',
      '#toggleNav',
      '#mobileNav',
      '.cmp-navigation--mobile',
      'noscript',
    ]);

    // Stray empty <meta> tags nested inside cmp-image blocks
    // (cleaned.html lines 183, 204, 227, 271, 334, 378) — not authorable.
    element.querySelectorAll('meta').forEach((el) => el.remove());
  }
}
