import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Service providing utility methods for device detection and routing logic.
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectService {

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
}


