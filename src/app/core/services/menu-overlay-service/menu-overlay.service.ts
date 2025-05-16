import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProjectService } from './../project-service/project.service';
import { fixateScrollingOnBody, releaseScrollOnBody } from '../../../shared/utils/scroll-lock.utils';

@Injectable({
  providedIn: 'root'
})
export class MenuOverlayService {
  private menuOverlayActiveSubject = new BehaviorSubject<boolean>(false);
  menuOverlayActive$ = this.menuOverlayActiveSubject.asObservable();

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

  setMenuOverlayActive(isActive: boolean) {
    if (isActive && this.projectService.isMobileWide()) {
      this.menuOverlayActiveSubject.next(true);
    } else if (!isActive) {
      this.menuOverlayActiveSubject.next(false);
    }
  }

  getMenuOverlayActive(): Observable<boolean> {
    return this.menuOverlayActive$;
  }
}

