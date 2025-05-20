import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProjectService } from './../project-service/project.service';
import { fixateScrollingOnBody, releaseScrollOnBody } from '../../../shared/utils/scroll-lock.utils';

/**
 * Service to control the visibility of the mobile menu overlay.
 * It handles state changes and ensures proper scroll locking behavior on body.
 */
@Injectable({
  providedIn: 'root'
})
export class MenuOverlayService {
  /** Subject that tracks whether the menu overlay is active */
  private menuOverlayActiveSubject = new BehaviorSubject<boolean>(false);

  /** Observable stream exposing the current menu overlay active state */
  menuOverlayActive$ = this.menuOverlayActiveSubject.asObservable();

  /**
   * Initializes the menu overlay state and registers a window resize listener
   * to deactivate the overlay on non-mobile viewports.
   *
   * @param projectService - Service used to determine the current viewport size
   */
  constructor(private projectService: ProjectService) {
    if (!this.projectService.isMobileWide()) {
      this.menuOverlayActiveSubject.next(false);
      releaseScrollOnBody();
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        if (!this.projectService.isMobileWide()) {
          this.menuOverlayActiveSubject.next(false);
          releaseScrollOnBody();
        }
      });
    }
  }

  /**
   * Sets the active state of the menu overlay.
   * Only activates the overlay on mobile-wide viewports.
   *
   * @param isActive - Whether the menu overlay should be active
   */
  setMenuOverlayActive(isActive: boolean) {
    if (isActive && this.projectService.isMobileWide()) {
      this.menuOverlayActiveSubject.next(true);
    } else if (!isActive) {
      this.menuOverlayActiveSubject.next(false);
    }
  }

  /**
   * Returns an observable of the current menu overlay active state.
   *
   * @returns Observable that emits a boolean indicating overlay visibility
   */
  getMenuOverlayActive(): Observable<boolean> {
    return this.menuOverlayActive$;
  }
}


