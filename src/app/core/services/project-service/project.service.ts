import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  isMobile(threshold: number = 530): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.innerWidth < threshold;
    }
    return false;
  }

  isMobileWide(): boolean {
    return this.isMobile(1000);
  }
}

