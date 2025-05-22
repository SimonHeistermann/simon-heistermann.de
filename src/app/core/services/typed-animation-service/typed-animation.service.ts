import { Injectable, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Typed from 'typed.js';
import { TypedOptions } from './../../models/typed-options.interface';

/**
 * Service for managing typed text animations using the Typed.js library.
 * Supports single and sequential animations, as well as cleanup of instances.
 */
@Injectable({
  providedIn: 'root'
})
export class TypedAnimationService {
  private typedInstances: Map<string, Typed> = new Map();

  /**
   * @param platformId - Used to detect if the code is running in a browser environment
   */
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Animates text on the given element using Typed.js.
   * Destroys any existing animation instance with the same ID before starting a new one.
   *
   * @param element - DOM element reference where the text will be typed
   * @param text - Text content to animate
   * @param options - Optional Typed.js configuration overrides
   * @param instanceId - Unique ID to manage the instance lifecycle
   * @returns A promise that resolves when the animation completes
   */
  animateText(
    element: ElementRef,
    text: string,
    options: Partial<TypedOptions> = {},
    instanceId: string
  ): Promise<void> {
    if (!this.isPlatformBrowser()) {
      return Promise.resolve();
    }

    // Sicherstellen, dass das Element leer ist und bereit für neue Animation
    this.prepareElement(element);
    
    // Alte Instanz zerstören falls vorhanden
    this.destroyInstance(instanceId);
    
    // Kurze Verzögerung um sicherzustellen, dass DOM bereit ist
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.createTypedPromise(element, text, options, instanceId).then(resolve);
      }, 50);
    });
  }

  /**
   * Animates a sequence of text animations one after the other.
   *
   * @param animations - Array of animation definitions
   * @returns A promise that resolves when all animations are complete
   */
  async animateSequence(animations: Array<{
    element: ElementRef,
    text: string,
    options?: Partial<TypedOptions>,
    instanceId: string
  }>): Promise<void> {
    if (!this.isPlatformBrowser()) {
      return Promise.resolve();
    }

    // Alle Elemente vorbereiten
    animations.forEach(animation => {
      this.prepareElement(animation.element);
    });

    // Sequenziell animieren
    for (const animation of animations) {
      await this.animateText(
        animation.element,
        animation.text,
        animation.options || {},
        animation.instanceId
      );
      
      // Kleine Verzögerung zwischen Animationen
      await this.delay(100);
    }
  }

  /**
   * Destroys a specific typed animation instance by its ID.
   *
   * @param instanceId - The unique ID of the animation instance
   */
  destroyInstance(instanceId: string): void {
    const typedInstance = this.getTypedInstance(instanceId);
    if (typedInstance) {
      try {
        typedInstance.destroy();
      } catch (error) {
        console.warn(`Error destroying typed instance ${instanceId}:`, error);
      }
    }
    this.typedInstances.delete(instanceId);
  }

  /**
   * Destroys all currently active typed animation instances.
   */
  destroyAllInstances(): void {
    this.typedInstances.forEach((instance, instanceId) => {
      this.destroyInstance(instanceId);
    });
    this.typedInstances.clear();
  }

  /**
   * Checks whether the code is executing in a browser environment.
   *
   * @returns True if running in a browser, otherwise false
   */
  private isPlatformBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Prepares an element for animation by clearing its content and resetting styles.
   *
   * @param element - DOM element to prepare
   */
  private prepareElement(element: ElementRef): void {
    if (element?.nativeElement) {
      const el = element.nativeElement;
      el.innerHTML = '';
      el.style.opacity = '1';
      el.style.visibility = 'visible';
    }
  }

  /**
   * Creates a delay using Promise.
   *
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Creates a new Typed.js instance and resolves a promise when the animation is complete.
   *
   * @param element - DOM element to animate
   * @param text - Text to display
   * @param options - User-defined options to override defaults
   * @param instanceId - Unique ID to track the instance
   * @returns A promise that resolves when the animation is complete
   */
  private createTypedPromise(
    element: ElementRef,
    text: string,
    options: Partial<TypedOptions>,
    instanceId: string
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        if (!element?.nativeElement) {
          console.warn(`Element for instance ${instanceId} not found`);
          resolve();
          return;
        }

        const mergedOptions = this.getMergedOptions(options, text, resolve);
        const typedInstance = new Typed(element.nativeElement, mergedOptions);
        this.typedInstances.set(instanceId, typedInstance);
      } catch (error) {
        console.error(`Error creating typed instance ${instanceId}:`, error);
        resolve(); // Resolve anyway to not break the sequence
      }
    });
  }

  /**
   * Merges user-defined options with default options.
   *
   * @param options - Custom options provided by the caller
   * @param text - Text to animate
   * @param resolve - Callback to invoke when the animation is complete
   * @returns A complete set of options for the Typed instance
   */
  private getMergedOptions(options: Partial<TypedOptions>, text: string, resolve: () => void): Partial<TypedOptions> {
    const defaultOptions = this.getDefaultTypedOptions(text, resolve);
    return { ...defaultOptions, ...options };
  }

  /**
   * Returns default options for a Typed.js animation.
   *
   * @param text - Text to animate
   * @param resolve - Callback to call on animation complete
   * @returns A default TypedOptions object
   */
  private getDefaultTypedOptions(text: string, resolve: () => void): Partial<TypedOptions> {
    return {
      strings: [text],
      typeSpeed: 70,
      showCursor: false,
      loop: false,
      fadeOut: false,
      fadeOutClass: 'typed-fade-out',
      fadeOutDelay: 0,
      onComplete: () => this.onComplete(resolve)
    };
  }

  /**
   * Handler invoked when a Typed.js animation is complete.
   *
   * @param resolve - Callback function to resolve the promise
   */
  private onComplete(resolve: () => void): void {
    // Kleine Verzögerung um sicherzustellen, dass Animation vollständig ist
    setTimeout(() => {
      resolve();
    }, 50);
  }

  /**
   * Retrieves a Typed instance by its unique ID.
   *
   * @param instanceId - ID of the animation instance
   * @returns The corresponding Typed instance or undefined if not found
   */
  private getTypedInstance(instanceId: string): Typed | undefined {
    return this.typedInstances.get(instanceId);
  }
}


