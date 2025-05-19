import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) { }

  isMobile(threshold: number = 530): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.innerWidth < threshold;
    }
    return false;
  }

  isMobileWide(): boolean {
    return this.isMobile(1000);
  }

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

