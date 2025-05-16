import { Injectable, ElementRef, Renderer2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextOverlayService {

  constructor(private renderer: Renderer2) {}

  watchTextOverlap(
    textElements: ElementRef[],
    blueElement: ElementRef,
    defaultColor: string = 'var(--color-primary)',
    overlapColor: string = 'white'
  ) {
    const updateColors = () => this.updateTextColors(textElements, blueElement, defaultColor, overlapColor);
    updateColors();
    const observer = new ResizeObserver(updateColors);
    observer.observe(blueElement.nativeElement);
    textElements.forEach(el => observer.observe(el.nativeElement));
    window.addEventListener('scroll', updateColors);
    window.addEventListener('resize', updateColors);
  }

  private updateTextColors(
    textElements: ElementRef[],
    blueElement: ElementRef,
    defaultColor: string,
    overlapColor: string
  ) {
    const blueRect = blueElement.nativeElement.getBoundingClientRect();
    textElements.forEach(textEl => {
      const textRect = textEl.nativeElement.getBoundingClientRect();
      const isMajorityOverlapping = this.isMajorOverlap(textRect, blueRect);
      const color = isMajorityOverlapping ? overlapColor : defaultColor;
      this.setTextColor(textEl, color);
    });
  }

  private isMajorOverlap(textRect: DOMRect, targetRect: DOMRect): boolean {
    const intersection = this.getIntersectionRect(textRect, targetRect);
    const intersectionArea = intersection.width * intersection.height;
    const textArea = textRect.width * textRect.height;
    return intersectionArea / textArea > 0.9999;
  }

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

  private setTextColor(el: ElementRef, color: string) {
    this.renderer.setStyle(el.nativeElement, 'color', color);
  }
}

