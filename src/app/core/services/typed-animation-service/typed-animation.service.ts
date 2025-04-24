import { Injectable, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Typed from 'typed.js';
import { TypedOptions } from './../../models/typed-options.interface';

@Injectable({
  providedIn: 'root'
})
export class TypedAnimationService {
  private typedInstances: Map<string, Typed> = new Map();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  animateText(
    element: ElementRef,
    text: string,
    options: Partial<TypedOptions> = {},
    instanceId: string
  ): Promise<void> {
    if (!this.isPlatformBrowser()) {
      return Promise.resolve();
    }

    this.destroyInstance(instanceId);
    return this.createTypedPromise(element, text, options, instanceId);
  }

  async animateSequence(animations: Array<{
    element: ElementRef,
    text: string,
    options?: Partial<TypedOptions>,
    instanceId: string
  }>): Promise<void> {
    if (!this.isPlatformBrowser()) {
      return Promise.resolve();
    }

    for (const animation of animations) {
      await this.animateText(
        animation.element,
        animation.text,
        animation.options || {},
        animation.instanceId
      );
    }
  }

  destroyInstance(instanceId: string): void {
    const typedInstance = this.getTypedInstance(instanceId);
    if (typedInstance) {
      typedInstance.destroy();
    }
    this.typedInstances.delete(instanceId);
  }

  destroyAllInstances(): void {
    this.typedInstances.forEach((instance, instanceId) => {
      this.destroyInstance(instanceId);
    });
    this.typedInstances.clear();
  }

  private isPlatformBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private createTypedPromise(
    element: ElementRef,
    text: string,
    options: Partial<TypedOptions>,
    instanceId: string
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const mergedOptions = this.getMergedOptions(options, text, resolve);
      const typedInstance = new Typed(element.nativeElement, mergedOptions);
      this.typedInstances.set(instanceId, typedInstance);
    });
  }

  private getMergedOptions(options: Partial<TypedOptions>, text: string, resolve: () => void): Partial<TypedOptions> {
    const defaultOptions = this.getDefaultTypedOptions(text, resolve);
    return { ...defaultOptions, ...options };
  }

  private getDefaultTypedOptions(text: string, resolve: () => void): Partial<TypedOptions> {
    return {
      strings: [text],
      typeSpeed: 70,
      showCursor: false,
      loop: false,
      onComplete: () => this.onComplete(resolve)
    };
  }

  private onComplete(resolve: () => void): void {
    resolve();
  }

  private getTypedInstance(instanceId: string): Typed | undefined {
    return this.typedInstances.get(instanceId);
  }
}

