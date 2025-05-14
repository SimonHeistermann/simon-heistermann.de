export function fixateScrollingOnBody(): void {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.dataset['scrollY'] = scrollY.toString();
}

function disableSmoothScroll(): string | undefined {
    const html = document.documentElement;
    const previousScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    return previousScrollBehavior;
}

function restoreScrollBehavior(previousScrollBehavior: string | undefined): void {
    const html = document.documentElement;
    if (previousScrollBehavior) {
        html.style.scrollBehavior = previousScrollBehavior;
    } else {
        html.style.removeProperty('scroll-behavior');
    }
}

function getScrollPosition(): number {
    return parseInt(document.body.dataset['scrollY'] || '0', 10);
}

function resetBodyStyles(): void {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    delete document.body.dataset['scrollY'];
}

export function releaseScrollOnBody(): void {
    const previousScrollBehavior = disableSmoothScroll(); 
    const scrollY = getScrollPosition();
    resetBodyStyles();
    window.scrollTo(0, scrollY);
    restoreScrollBehavior(previousScrollBehavior); 
}

  
  
  
  