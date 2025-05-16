// text-overlay.service.ts
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
    this.checkOverlaps(textElements, blueElement, defaultColor, overlapColor);
    const resizeObserver = new ResizeObserver(() => {
      this.checkOverlaps(textElements, blueElement, defaultColor, overlapColor);
    });
    resizeObserver.observe(blueElement.nativeElement);
    textElements.forEach(el => resizeObserver.observe(el.nativeElement));
    window.addEventListener('scroll', () => {
      this.checkOverlaps(textElements, blueElement, defaultColor, overlapColor);
    });
    window.addEventListener('resize', () => {
      this.checkOverlaps(textElements, blueElement, defaultColor, overlapColor);
    });
  }
  
  private checkOverlaps(
    textElements: ElementRef[], 
    blueElement: ElementRef, 
    defaultColor: string,
    overlapColor: string
  ) {
    const blueRect = blueElement.nativeElement.getBoundingClientRect();
    
    textElements.forEach(textEl => {
      const textRect = textEl.nativeElement.getBoundingClientRect();
      const isOverlapping = !(
        textRect.right < blueRect.left || 
        textRect.left > blueRect.right || 
        textRect.bottom < blueRect.top || 
        textRect.top > blueRect.bottom
      );
      if (isOverlapping) {
        this.renderer.setStyle(textEl.nativeElement, 'color', overlapColor);
      } else {
        this.renderer.setStyle(textEl.nativeElement, 'color', defaultColor);
      }
    });
  }
}
