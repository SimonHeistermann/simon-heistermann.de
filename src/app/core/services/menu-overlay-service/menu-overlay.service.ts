import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProjectService } from './../project-service/project.service';
import { releaseScrollOnBody } from '../../../shared/utils/scroll-lock.utils';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class MenuOverlayService {
  /**
   * BehaviorSubject tracking whether the menu overlay is active.
   */
  private menuOverlayActiveSubject = new BehaviorSubject<boolean>(false);

  /**
   * Observable that emits the current state of the menu overlay (active/inactive).
   */
  menuOverlayActive$ = this.menuOverlayActiveSubject.asObservable();

  /**
   * Creates an instance of MenuOverlayService.
   * Initializes overlay state and sets up resize event listener for desktop/mobile responsiveness.
   * 
   * @param projectService - Service to check project-related states like screen size
   * @param platformId - Platform identifier used to detect if running in a browser
   */
  constructor(
    private projectService: ProjectService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (this.isBrowser()) {
      this.initializeMenuOverlayState();
      this.registerResizeListener();
    }
  }

  /**
   * Sets the active state of the menu overlay.
   * Only activates the overlay if the device screen is considered mobile-wide.
   * 
   * @param isActive - Desired active state of the menu overlay
   */
  setMenuOverlayActive(isActive: boolean): void {
    if (isActive && this.projectService.isMobileWide()) {
      this.menuOverlayActiveSubject.next(true);
    } else if (!isActive) {
      this.menuOverlayActiveSubject.next(false);
    }
  }

  /**
   * Returns an observable to subscribe to the current active state of the menu overlay.
   * 
   * @returns Observable emitting boolean values indicating overlay active state
   */
  getMenuOverlayActive(): Observable<boolean> {
    return this.menuOverlayActive$;
  }

  /**
   * Checks if the current platform is a browser.
   * 
   * @returns true if running in browser, false otherwise
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Initializes the menu overlay state based on screen size.
   */
  private initializeMenuOverlayState(): void {
    if (!this.projectService.isMobileWide()) {
      this.deactivateMenuOverlay();
    }
  }

  /**
   * Registers a window resize event listener to update overlay state accordingly.
   */
  private registerResizeListener(): void {
    window.addEventListener('resize', () => {
      if (!this.projectService.isMobileWide()) {
        this.deactivateMenuOverlay();
      }
    });
  }

  /**
   * Deactivates the menu overlay and releases the scroll lock on the body.
   */
  private deactivateMenuOverlay(): void {
    this.menuOverlayActiveSubject.next(false);
    releaseScrollOnBody();
  }
}