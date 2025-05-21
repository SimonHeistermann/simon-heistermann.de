import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Service responsible for managing the favicon of the application.
 * Automatically switches between light and dark mode favicons based on user's system preferences.
 */
@Injectable({
  providedIn: 'root'
})
export class FaviconService {
  /** Path to the favicon for light mode */
  private readonly LIGHT_FAVICON = 'favicon_blue.ico';
  
  /** Path to the favicon for dark mode */
  private readonly DARK_FAVICON = 'favicon_white.ico';
  
  /**
   * Creates an instance of FaviconService.
   * @param platformId - Injection token that represents the current platform
   */
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  
  /**
   * Checks if the current platform is a browser.
   * @returns True if the application is running in a browser, false otherwise
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
  
  /**
   * Determines if the user's system is using dark mode.
   * @returns True if dark mode is enabled, false otherwise
   */
  private isDarkMode(): boolean {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  }
  
  /**
   * Gets the appropriate favicon path based on the color scheme.
   * @returns The path to the favicon that matches the current color scheme
   */
  private getFaviconPath(): string {
    return this.isDarkMode() ? this.DARK_FAVICON : this.LIGHT_FAVICON;
  }
  
  /**
   * Retrieves the existing favicon element or creates a new one if none exists.
   * @returns The favicon link element
   */
  private getFaviconElement(): HTMLLinkElement {
    return document.querySelector('link[rel="icon"]') || 
           this.createNewFaviconElement();
  }
  
  /**
   * Creates a new favicon link element.
   * @returns A newly created favicon link element
   */
  private createNewFaviconElement(): HTMLLinkElement {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    return link;
  }
  
  /**
   * Sets the href attribute of the favicon element and appends it to the document head.
   * @param link - The favicon link element to update
   */
  private setFaviconHref(link: HTMLLinkElement): void {
    link.href = this.getFaviconPath();
    document.head.appendChild(link);
  }
  
  /**
   * Updates the favicon to match the current color scheme.
   * Does nothing if not running in a browser environment.
   */
  updateFavicon(): void {
    if (!this.isBrowser()) return;
    
    const faviconElement = this.getFaviconElement();
    this.setFaviconHref(faviconElement);
  }
  
  /**
   * Initializes the favicon and sets up listeners for color scheme changes.
   * Should be called during application initialization.
   * Does nothing if not running in a browser environment.
   */
  setupFaviconSwitcher(): void {
    if (!this.isBrowser()) return;
    
    this.updateFavicon();
    this.registerColorSchemeListener();
  }
  
  /**
   * Registers an event listener that updates the favicon when the color scheme changes.
   */
  private registerColorSchemeListener(): void {
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => this.updateFavicon());
  }
}
