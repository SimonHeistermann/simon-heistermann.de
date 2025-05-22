import { Injectable, ElementRef, Renderer2, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TextOverlayService {
  private isBrowser: boolean;
  private observers: ResizeObserver[] = [];
  private intersectionObserver?: IntersectionObserver;
  private animationFrameId?: number;
  private isUpdating = false;

  constructor(
    private renderer: Renderer2, 
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  watchTextOverlap(
    textElements: ElementRef[],
    targetElement: ElementRef,
    defaultColor: string = 'var(--color-primary)',
    overlapColor: string = 'white',
    overlapThreshold: number = 0.8
  ) {
    if (!this.shouldInitialize(textElements, targetElement)) return;
    this.cleanup();
    this.scheduleInitialization(textElements, targetElement, defaultColor, overlapColor, overlapThreshold);
  }

  private shouldInitialize(textElements: ElementRef[], targetElement: ElementRef): boolean {
    return this.isBrowser && textElements.length > 0 && !!targetElement;
  }

  private scheduleInitialization(
    textElements: ElementRef[],
    targetElement: ElementRef,
    defaultColor: string,
    overlapColor: string,
    overlapThreshold: number
  ) {
    this.scheduleUpdate(() => {
      this.initializeAllObservers(textElements, targetElement, defaultColor, overlapColor, overlapThreshold);
      this.registerEventListeners(textElements, targetElement, defaultColor, overlapColor, overlapThreshold);
      this.updateTextColors(textElements, targetElement, defaultColor, overlapColor, overlapThreshold);
    });
  }

  private initializeAllObservers(
    textElements: ElementRef[],
    targetElement: ElementRef,
    defaultColor: string,
    overlapColor: string,
    overlapThreshold: number
  ) {
    this.createIntersectionObserver(textElements, targetElement, defaultColor, overlapColor, overlapThreshold);
    this.createResizeObserver(textElements, targetElement, defaultColor, overlapColor, overlapThreshold);
  }

  private createIntersectionObserver(
    textElements: ElementRef[],
    targetElement: ElementRef,
    defaultColor: string,
    overlapColor: string,
    overlapThreshold: number
  ) {
    const config = this.getIntersectionObserverConfig();
    const callback = () => this.scheduleColorUpdate(textElements, targetElement, defaultColor, overlapColor, overlapThreshold);
    this.intersectionObserver = new IntersectionObserver(callback, config);
    this.observeAllElements([...textElements, targetElement]);
  }

  private getIntersectionObserverConfig() {
    const thresholds = Array.from({ length: 21 }, (_, i) => i * 0.05);
    return { threshold: thresholds, rootMargin: '10px' };
  }

  private observeAllElements(elements: ElementRef[]) {
    elements.forEach(el => {
      if (el?.nativeElement) {
        this.intersectionObserver!.observe(el.nativeElement);
      }
    });
  }

  private createResizeObserver(
    textElements: ElementRef[],
    targetElement: ElementRef,
    defaultColor: string,
    overlapColor: string,
    overlapThreshold: number
  ) {
    const callback = () => this.scheduleColorUpdate(textElements, targetElement, defaultColor, overlapColor, overlapThreshold);
    const resizeObserver = new ResizeObserver(callback);
    this.observers.push(resizeObserver);
    this.observeElementsForResize(resizeObserver, [...textElements, targetElement]);
  }

  private observeElementsForResize(observer: ResizeObserver, elements: ElementRef[]) {
    elements.forEach(el => {
      if (el?.nativeElement) {
        observer.observe(el.nativeElement);
      }
    });
  }

  private registerEventListeners(
    textElements: ElementRef[],
    targetElement: ElementRef,
    defaultColor: string,
    overlapColor: string,
    overlapThreshold: number
  ) {
    const callback = () => this.scheduleColorUpdate(textElements, targetElement, defaultColor, overlapColor, overlapThreshold);
    const events = ['scroll', 'resize', 'orientationchange'];
    
    this.ngZone.runOutsideAngular(() => {
      events.forEach(event => window.addEventListener(event, callback, { passive: true }));
    });
  }

  private scheduleColorUpdate(
    textElements: ElementRef[],
    targetElement: ElementRef,
    defaultColor: string,
    overlapColor: string,
    overlapThreshold: number
  ) {
    this.scheduleUpdate(() => {
      this.updateTextColors(textElements, targetElement, defaultColor, overlapColor, overlapThreshold);
    });
  }

  private scheduleUpdate(callback: () => void) {
    if (this.isUpdating) return;
    this.isUpdating = true;
    this.cancelPendingUpdate();
    this.animationFrameId = requestAnimationFrame(() => {
      this.executeUpdate(callback);
    });
  }

  private cancelPendingUpdate() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private executeUpdate(callback: () => void) {
    try {
      callback();
    } finally {
      this.isUpdating = false;
    }
  }

  private updateTextColors(
    textElements: ElementRef[],
    targetElement: ElementRef,
    defaultColor: string,
    overlapColor: string,
    overlapThreshold: number
  ) {
    const targetRect = this.getElementRect(targetElement);
    if (!targetRect) return;
    textElements.forEach(textEl => {
      this.updateSingleTextColor(textEl, targetRect, defaultColor, overlapColor, overlapThreshold);
    });
  }

  private updateSingleTextColor(
    textElement: ElementRef,
    targetRect: DOMRect,
    defaultColor: string,
    overlapColor: string,
    overlapThreshold: number
  ) {
    const textRect = this.getElementRect(textElement);
    if (!textRect) return;
    const shouldUseOverlapColor = this.isElementOverlapping(textRect, targetRect, overlapThreshold);
    const color = shouldUseOverlapColor ? overlapColor : defaultColor;
    this.setElementColor(textElement, color);
  }

  private isElementOverlapping(textRect: DOMRect, targetRect: DOMRect, threshold: number): boolean {
    const overlapRatio = this.calculateOverlapRatio(textRect, targetRect);
    return overlapRatio >= threshold;
  }

  private calculateOverlapRatio(textRect: DOMRect, targetRect: DOMRect): number {
    const intersection = this.getIntersectionRect(textRect, targetRect);
    const textArea = textRect.width * textRect.height;
    
    if (textArea === 0) return 0;
    
    const intersectionArea = intersection.width * intersection.height;
    return intersectionArea / textArea;
  }

  private getIntersectionRect(a: DOMRect, b: DOMRect): DOMRect {
    const left = Math.max(a.left, b.left);
    const right = Math.min(a.right, b.right);
    const top = Math.max(a.top, b.top);
    const bottom = Math.min(a.bottom, b.bottom);
    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);
    return new DOMRect(left, top, width, height);
  }

  private getElementRect(element: ElementRef): DOMRect | null {
    try {
      if (!element?.nativeElement) return null;
      const rect = element.nativeElement.getBoundingClientRect();
      return this.isRectValid(rect) ? rect : null;
    } catch (error) {
      console.warn('Error getting element rect:', error);
      return null;
    }
  }

  private isRectValid(rect: DOMRect): boolean {
    return rect.width > 0 && rect.height > 0;
  }

  private setElementColor(element: ElementRef, color: string) {
    if (!element?.nativeElement) return;
    try {
      const shouldUpdate = this.shouldUpdateColor(element, color);
      if (shouldUpdate) {
        this.applyColorChange(element, color);
      }
    } catch (error) {
      console.warn('Error setting element color:', error);
    }
  }

  private shouldUpdateColor(element: ElementRef, newColor: string): boolean {
    const currentColor = getComputedStyle(element.nativeElement).color;
    const resolvedNewColor = this.resolveColorValue(newColor);
    return currentColor !== resolvedNewColor;
  }

  private applyColorChange(element: ElementRef, color: string) {
    this.ngZone.run(() => {
      this.renderer.setStyle(element.nativeElement, 'color', color);
    });
  }

  private resolveColorValue(color: string): string {
    if (!color.startsWith('var(')) return color;
    try {
      return this.getComputedColorValue(color);
    } catch {
      return color;
    }
  }

  private getComputedColorValue(color: string): string {
    const tempElement = document.createElement('div');
    tempElement.style.color = color;
    document.body.appendChild(tempElement);
    const computedColor = getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);
    return computedColor;
  }

  cleanup() {
    this.cancelPendingUpdate();
    this.disconnectIntersectionObserver();
    this.disconnectResizeObservers();
  }

  private disconnectIntersectionObserver() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = undefined;
    }
  }

  private disconnectResizeObservers() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  ngOnDestroy() {
    this.cleanup();
  }
}