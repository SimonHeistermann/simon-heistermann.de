import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  isMobile(threshold: number = 424): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.innerWidth < threshold;
    }
    return false; 
  }
}
