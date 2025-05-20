/**
 * Checks if the current environment is a browser.
 * @returns `true` if running in a browser environment, otherwise `false`.
 */
function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Fixates scrolling on the document body by setting CSS styles
 * to prevent the body from scrolling and preserving the current scroll position.
 */
export function fixateScrollingOnBody(): void {
  if (!isBrowser()) return;
  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  document.body.dataset['scrollY'] = scrollY.toString();
}

/**
 * Disables smooth scrolling on the root HTML element.
 * @returns The previous value of the `scroll-behavior` style, or `undefined` if not set.
 */
function disableSmoothScroll(): string | undefined {
  if (!isBrowser()) return;
  const html = document.documentElement;
  const previousScrollBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  return previousScrollBehavior;
}

/**
 * Restores the `scroll-behavior` style of the root HTML element to its previous value.
 * @param previousScrollBehavior The previous scroll behavior style to restore.
 */
function restoreScrollBehavior(previousScrollBehavior: string | undefined): void {
  if (!isBrowser()) return;
  const html = document.documentElement;
  if (previousScrollBehavior) {
    html.style.scrollBehavior = previousScrollBehavior;
  } else {
    html.style.removeProperty('scroll-behavior');
  }
}

/**
 * Retrieves the saved scroll position from the document body's dataset.
 * @returns The vertical scroll position in pixels.
 */
function getScrollPosition(): number {
  if (!isBrowser()) return 0;
  return parseInt(document.body.dataset['scrollY'] || '0', 10);
}

/**
 * Resets the inline styles and dataset properties applied to the document body
 * to restore normal scrolling behavior.
 */
function resetBodyStyles(): void {
  if (!isBrowser()) return;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  delete document.body.dataset['scrollY'];
}

/**
 * Releases the scroll lock on the document body by resetting styles,
 * restoring scroll position, and re-enabling smooth scrolling if it was previously set.
 */
export function releaseScrollOnBody(): void {
  if (!isBrowser()) return;
  const previousScrollBehavior = disableSmoothScroll();
  const scrollY = getScrollPosition();
  resetBodyStyles();
  window.scrollTo(0, scrollY);
  restoreScrollBehavior(previousScrollBehavior);
}  