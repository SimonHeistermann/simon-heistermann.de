import { Injectable, Inject, PLATFORM_ID, ElementRef, Renderer2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TypedOptions } from './../../models/typed-options.interface';

/**
 * Service providing utility methods for device detection, routing logic,
 * DOM manipulation, and animation configuration.
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  /** Default text color (CSS variable) */
  private readonly defaultTextColor: string = 'var(--color-primary)';
  
  /** Text color when overlapping with the ellipse element */
  private readonly overlayTextColor: string = 'white';

  /**
   * @param platformId - The platform identifier used to check if code is running in the browser
   * @param router - Angular Router instance for navigation
   */
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  /**
   * Determines if the current device viewport width is smaller than the given threshold.
   *
   * @param threshold - The maximum width (in pixels) considered as mobile; defaults to 530
   * @returns `true` if running in the browser and the viewport is narrower than the threshold, otherwise `false`
   */
  isMobile(threshold: number = 530): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.innerWidth < threshold;
    }
    return false;
  }

  /**
   * Determines if the current device is a wide mobile device (e.g. tablet or large phone).
   *
   * @returns `true` if the viewport is less than 1000px wide, otherwise `false`
   */
  isMobileWide(): boolean {
    return this.isMobile(1000);
  }

  /**
   * Navigates to the homepage. If already on the homepage, reloads the page.
   * Only executes if running in the browser environment.
   */
  navigateHome(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const currentUrl = this.router.url;
    if (currentUrl === '/' || currentUrl === '') {
      window.location.reload();
    } else {
      this.router.navigateByUrl('/');
    }
  }

  /**
   * Creates a delay using Promise.
   *
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Creates a configuration object for a text animation.
   * 
   * @param element - The DOM element where the animation will be applied.
   * @param translationKey - The key used to fetch the translated text for the animation.
   * @param instanceId - A unique identifier for the animation instance.
   * @param typeSpeed - The speed at which the text is typed, in milliseconds per character.
   * @param translateService - Service for translating text keys
   * 
   * @returns An object containing the animation configuration including the element reference,
   *          translated text, instance ID, and typing options.
   */
  createAnimationConfig(
    element: ElementRef,
    translationKey: string,
    instanceId: string,
    typeSpeed: number,
    translateService: TranslateService
  ): { element: ElementRef, text: string, instanceId: string, options: Partial<TypedOptions> } {
    return {
      element,
      text: translateService.instant(translationKey),
      instanceId,
      options: {
        typeSpeed,
        showCursor: false
      }
    };
  }

  /**
   * Finds the vertical offset position of the next section in the document.
   * 
   * @param hostElement - The host element to search within
   * @param fallbackHeight - Fallback height if no next section is found
   * @returns The vertical offset position of the next section in pixels
   */
  findNextSectionOffset(hostElement: ElementRef, fallbackHeight: number): number {
    const nextSection = hostElement.nativeElement.parentElement.querySelector('section:nth-child(2)');
    return nextSection ? nextSection.offsetTop : fallbackHeight;
  }

  /**
   * Moves the scroll box element based on scroll position.
   * 
   * @param scrollBox - Reference to the scroll box element
   * @param renderer - Angular renderer for DOM manipulation
   * @param scrollY - Current vertical scroll position in pixels
   * @param fadeThreshold - Threshold position for maximum movement
   * @param scrollMovementFactor - Factor determining the speed of scroll movement
   */
  moveScrollBox(
    scrollBox: ElementRef, 
    renderer: Renderer2, 
    scrollY: number, 
    fadeThreshold: number, 
    scrollMovementFactor: number
  ): void {
    const scrollBoxElement = scrollBox.nativeElement;
    const translation = Math.min(scrollY * scrollMovementFactor, fadeThreshold * scrollMovementFactor);
    renderer.setStyle(scrollBoxElement, 'transform', `translateY(${translation}px)`);
  }

  /**
   * Updates the scroll line height based on scroll position.
   * 
   * @param scrollLine - Reference to the scroll line element
   * @param renderer - Angular renderer for DOM manipulation
   * @param scrollY - Current vertical scroll position in pixels
   * @param introSectionHeight - Height of the intro section in pixels
   * @param scrollMovementFactor - Factor determining the speed of scroll movement
   */
  updateScrollLine(
    scrollLine: ElementRef, 
    renderer: Renderer2, 
    scrollY: number, 
    introSectionHeight: number, 
    scrollMovementFactor: number
  ): void {
    const scrollLineElement = scrollLine.nativeElement;
    const lineHeight = introSectionHeight * 0.3056;
    const remainingLineHeight = Math.max(lineHeight - scrollY * scrollMovementFactor, 0);
    renderer.setStyle(scrollLineElement, 'height', `${remainingLineHeight}px`);
  }

  /**
   * Updates the scroll text opacity based on scroll position.
   * 
   * @param scrollText - Reference to the scroll text element
   * @param renderer - Angular renderer for DOM manipulation
   * @param scrollY - Current vertical scroll position in pixels
   * @param fadeThreshold - Threshold position for complete fade-out
   */
  updateScrollTextOpacity(
    scrollText: ElementRef, 
    renderer: Renderer2, 
    scrollY: number, 
    fadeThreshold: number
  ): void {
    const scrollTextElement = scrollText.nativeElement;
    const textOpacity = Math.max(1 - (scrollY / fadeThreshold), 0);
    renderer.setStyle(scrollTextElement, 'opacity', textOpacity.toString());
  }

  /**
   * Determines if two DOM rectangles are overlapping by a significant amount.
   * 
   * @param rect1 - First DOM rectangle (typically a text element)
   * @param rect2 - Second DOM rectangle (typically the ellipse)
   * @returns Boolean indicating significant overlap (>= 20% of text area)
   */
  isOverlapping(rect1: DOMRect, rect2: DOMRect): boolean {
    const xOverlap = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
    const yOverlap = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
    const overlapArea = xOverlap * yOverlap;
    
    const textArea = rect1.width * rect1.height;
    const overlapRatio = textArea > 0 ? overlapArea / textArea : 0;
    
    return overlapRatio >= 0.2;
  }

  /**
   * Updates the color of each text element based on its overlap with the ellipse.
   * 
   * @param elements - Array of text element references to update
   * @param blueRect - Bounding rectangle of the ellipse element
   * @param renderer - Angular renderer for DOM manipulation
   */
  updateTextElementColors(elements: ElementRef[], blueRect: DOMRect, renderer: Renderer2): void {
    elements.forEach(textEl => {
      const textRect = textEl.nativeElement.getBoundingClientRect();
      const isOverlapping = this.isOverlapping(textRect, blueRect);
      const color = isOverlapping ? this.overlayTextColor : this.defaultTextColor;
      renderer.setStyle(textEl.nativeElement, 'color', color);
    });
  }

  /**
   * Applies text colors based on a media query match.
   * 
   * @param mediaQuery - Media query to evaluate
   * @param elements - Array of text element references to update
   * @param renderer - Angular renderer for DOM manipulation
   */
  applyColorsBasedOnMediaQuery(mediaQuery: MediaQueryList, elements: ElementRef[], renderer: Renderer2): void {
    const textColor = mediaQuery.matches ? 'white' : this.defaultTextColor;
    elements.forEach(textEl => {
      renderer.setStyle(textEl.nativeElement, 'color', textColor);
    });
  }

  /**
   * Sets up a media query change listener for fallback text color updates.
   * 
   * @param mediaQuery - Media query to monitor
   * @param elements - Array of text element references to update on changes
   * @param renderer - Angular renderer for DOM manipulation
   */
  setupMediaQueryListener(mediaQuery: MediaQueryList, elements: ElementRef[], renderer: Renderer2): void {
    mediaQuery.addEventListener('change', (e) => {
      const newColor = e.matches ? 'white' : this.defaultTextColor;
      elements.forEach(textEl => {
        renderer.setStyle(textEl.nativeElement, 'color', newColor);
      });
    });
  }

  /**
   * Checks if required browser features for text color changes are supported.
   * 
   * @param el - Element reference for getBoundingClientRect check
   * @returns Boolean indicating whether required features are available
   */
  isFeatureSupported(el: ElementRef): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const hasResizeObserver = 'ResizeObserver' in window;
    const hasGetBoundingClientRect = typeof el.nativeElement.getBoundingClientRect === 'function';
    return hasResizeObserver && hasGetBoundingClientRect;
  }
}

