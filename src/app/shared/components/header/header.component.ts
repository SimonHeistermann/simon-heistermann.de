import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslationService } from '../../../core/services/translation-service/translation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isHeaderHidden = false;
  private lastScrollTop = 0;
  private isMouseNearTop = false;
  private readonly MOUSE_THRESHOLD = 60;
  private isBrowser: boolean;
  private hasScrolled: boolean = false;
  selectedLanguage: string = 'de';

  private langSubscription!: Subscription;

  constructor
  (
    @Inject(PLATFORM_ID) platformId: Object, 
    private translationService: TranslationService, 
  ) 
  {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.lastScrollTop = this.getScrollTop();
    }
    this.langSubscription = this.translationService.currentLang$.subscribe(lang => {
      this.selectedLanguage = lang;
    });
  }

  @HostListener('window:scroll')
  handleScroll(): void {
    if (!this.isBrowser) return;
    const scrollTop = this.getScrollTop();
    if (!this.hasScrolled) {
      this.hasScrolled = true;
      this.lastScrollTop = scrollTop;
      return;
    }
    this.isHeaderHidden = this.shouldHideHeaderOnScroll(scrollTop);
    this.lastScrollTop = scrollTop;
  }

  @HostListener('document:mousemove', ['$event'])
  handleMouseMove(event: MouseEvent): void {
    if (!this.isBrowser) return;
    this.isMouseNearTop = event.clientY < this.MOUSE_THRESHOLD;
    const scrollTop = this.getScrollTop();
    if (!this.hasScrolled) {
      this.hasScrolled = true;
      this.lastScrollTop = scrollTop;
      return;
    }
    this.isHeaderHidden = this.shouldHideHeaderOnMouseMove(scrollTop);
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  private getScrollTop(): number {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }  

  private shouldHideHeaderOnScroll(scrollTop: number): boolean {
    if (scrollTop < 140) return false;
    return scrollTop > this.lastScrollTop && !this.isMouseNearTop;
  }

  private shouldHideHeaderOnMouseMove(scrollTop: number): boolean {
    if (scrollTop < 140) return false;
    return !this.isMouseNearTop && scrollTop > this.lastScrollTop;
  }

  selectLanguage(language: string): void {
    this.selectedLanguage = language;
    this.translationService.switchLanguage(language);
  }

}

