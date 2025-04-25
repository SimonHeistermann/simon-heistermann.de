import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslationService } from '../../../core/services/translation-service/translation.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isHeaderHidden = false;
  isHoveredHeader = false;
  hasScrolled = false; 
  isMouseNearTop = false;
  
  private lastScrollTop = 0;
  private readonly MOUSE_THRESHOLD = 120;
  private readonly SCROLL_THRESHOLD = 60;
  private isBrowser: boolean;
  selectedLanguage: string = 'de';

  private langSubscription!: Subscription;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object, 
    private translationService: TranslationService, 
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.lastScrollTop = this.getScrollTop();
      this.checkScrollPosition();
    }
    this.langSubscription = this.translationService.currentLang$.subscribe(lang => {
      this.selectedLanguage = lang;
    });
  }

  private checkScrollPosition(): void {
    const scrollTop = this.getScrollTop();
    this.hasScrolled = scrollTop >= this.SCROLL_THRESHOLD;
    this.isHeaderHidden = this.hasScrolled && !this.isMouseNearTop;
  }

  @HostListener('window:scroll')
  handleScroll(): void {
    if (!this.isBrowser) return;
    this.checkScrollPosition();
    this.lastScrollTop = this.getScrollTop();
  }

  @HostListener('document:mousemove', ['$event'])
  handleMouseMove(event: MouseEvent): void {
    if (!this.isBrowser) return;
    const wasNearTop = this.isMouseNearTop;
    this.isMouseNearTop = event.clientY < this.MOUSE_THRESHOLD;
    if (wasNearTop !== this.isMouseNearTop) {
      this.checkScrollPosition();
    }
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  private getScrollTop(): number {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }  

  selectLanguage(language: string): void {
    this.selectedLanguage = language;
    this.translationService.switchLanguage(language);
  }

  onHeaderMouseEnter(): void {
    this.isHoveredHeader = true;
  }

  onHeaderMouseLeave(): void {
    this.isHoveredHeader = false;
  }

  shouldApplyHoverStyle(): boolean {
    return this.hasScrolled && (this.isHoveredHeader || this.isMouseNearTop);
  }
}

