import { Injectable, ElementRef, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TextOverlayService {
  private isBrowser: boolean;

  /**
   * Creates an instance of TextOverlayService.
   * Checks if the platform is a browser.
   *
   * @param renderer - Angular Renderer2 for DOM manipulation
   * @param platformId - Platform identifier to detect browser environment
   */
  constructor(private renderer: Renderer2, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Observes the position and size of given text elements and a target element.
   * Updates the text color based on whether each text element significantly overlaps the target element.
   *
   * @param textElements - Array of ElementRefs to the text elements to monitor
   * @param blueElement - ElementRef to the element whose overlap should change the text color
   * @param defaultColor - Color to apply when not overlapping (default: `var(--color-primary)`)
   * @param overlapColor - Color to apply when overlapping (default: `'white'`)
   */
  watchTextOverlap(
    textElements: ElementRef[],
    blueElement: ElementRef,
    defaultColor: string = 'var(--color-primary)',
    overlapColor: string = 'white'
  ) {
    if (!this.isBrowser) return;
    const updateColors = () => 
      this.updateTextColors(textElements, blueElement, defaultColor, overlapColor);
    this.initializeObservers(textElements, blueElement, updateColors);
    this.registerWindowListeners(updateColors);
    updateColors();
  }

  /**
   * Initializes ResizeObserver for the target and text elements.
   *
   * @param textElements - Array of ElementRefs to observe
   * @param blueElement - ElementRef to observe
   * @param updateColors - Callback to update text colors
   */
  private initializeObservers(
    textElements: ElementRef[],
    blueElement: ElementRef,
    updateColors: () => void
  ) {
    const observer = new ResizeObserver(updateColors);
    observer.observe(blueElement.nativeElement);
    textElements.forEach(el => observer.observe(el.nativeElement));
  }

  /**
   * Registers window scroll and resize listeners to update text colors.
   *
   * @param updateColors - Callback to update text colors
   */
  private registerWindowListeners(updateColors: () => void) {
    window.addEventListener('scroll', updateColors);
    window.addEventListener('resize', updateColors);
  }

  /**
   * Updates the color of each text element based on whether it overlaps the target element.
   *
   * @param textElements - Array of text ElementRefs
   * @param blueElement - ElementRef of the target background element
   * @param defaultColor - Color to use if no overlap is detected
   * @param overlapColor - Color to use if overlap is detected
   */
  private updateTextColors(
    textElements: ElementRef[],
    blueElement: ElementRef,
    defaultColor: string,
    overlapColor: string
  ) {
    const blueRect = blueElement.nativeElement.getBoundingClientRect();

    textElements.forEach(textEl => {
      const textRect = textEl.nativeElement.getBoundingClientRect();
      const isOverlapping = this.isMajorOverlap(textRect, blueRect);
      this.setTextColor(textEl, isOverlapping ? overlapColor : defaultColor);
    });
  }

  /**
   * Determines whether two rectangles have a near-total overlap.
   *
   * @param textRect - The bounding rectangle of the text element
   * @param targetRect - The bounding rectangle of the target element
   * @returns `true` if the overlap covers ~100% of the text element
   */
  private isMajorOverlap(textRect: DOMRect, targetRect: DOMRect): boolean {
    const intersection = this.getIntersectionRect(textRect, targetRect);
    return this.isAlmostFullOverlap(intersection, textRect);
  }

  /**
   * Checks if the intersection rectangle covers nearly 100% of the text element.
   *
   * @param intersection - The intersection DOMRect
   * @param textRect - The bounding DOMRect of the text element
   * @returns true if intersection area / text area > 0.9999
   */
  private isAlmostFullOverlap(intersection: DOMRect, textRect: DOMRect): boolean {
    const intersectionArea = intersection.width * intersection.height;
    const textArea = textRect.width * textRect.height;
    return intersectionArea / textArea > 0.9999;
  }

  /**
   * Calculates the intersection rectangle between two bounding rectangles.
   *
   * @param a - First DOMRect
   * @param b - Second DOMRect
   * @returns A DOMRect representing the intersection area; zero-sized if there's no overlap
   */
  private getIntersectionRect(a: DOMRect, b: DOMRect): DOMRect {
    const left = Math.max(a.left, b.left);
    const right = Math.min(a.right, b.right);
    const top = Math.max(a.top, b.top);
    const bottom = Math.min(a.bottom, b.bottom);
    if (right < left || bottom < top) {
      return new DOMRect(0, 0, 0, 0);
    }
    return new DOMRect(left, top, right - left, bottom - top);
  }

  /**
   * Sets the text color of a given element using Angular's Renderer2.
   *
   * @param el - The ElementRef to update
   * @param color - The color to apply
   */
  private setTextColor(el: ElementRef, color: string) {
    this.renderer.setStyle(el.nativeElement, 'color', color);
  }
}