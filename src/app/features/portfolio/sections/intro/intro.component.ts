import { Component, OnInit, OnDestroy, Inject, ElementRef, ViewChild, AfterViewInit, PLATFORM_ID, Renderer2, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../../../core/services/translation-service/translation.service';
import { SocialButtonComponent } from '../../../../shared/components/social-button/social-button.component';
import { TypedAnimationService } from '../../../../core/services/typed-animation-service/typed-animation.service';
import { MenuOverlayComponent } from './menu-overlay/menu-overlay.component';
import { MenuOverlayService } from './../../../../core/services/menu-overlay-service/menu-overlay.service';

@Component({
  selector: 'app-intro',
  imports: [CommonModule, TranslateModule, SocialButtonComponent, MenuOverlayComponent],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.sass'
})
export class IntroComponent implements OnInit, OnDestroy, AfterViewInit {
  selectedLanguage: string = 'de';
  private langSubscription!: Subscription;
  private scrollAnimation: boolean = false;
  private introSectionHeight: number = 0;
  private nextSectionOffset: number = 0;
  private scrollBoxInitialPosition: number = 0;
  
  private scrollMovementFactor: number = 0.4;
  private fadeOutThreshold: number = 0.85;
  
  private textColorChangeActive: boolean = false;
  private defaultTextColor: string = 'var(--color-primary)';
  private overlayTextColor: string = 'white';

  isOverlayActive = false;

  @ViewChild('animatedSubtitle') subtitleElement!: ElementRef;
  @ViewChild('animatedTitle1') titleElement1!: ElementRef;
  @ViewChild('animatedTitle2') titleElement2!: ElementRef;
  @ViewChild('scrollBox') scrollBox!: ElementRef;
  @ViewChild('scrollLine') scrollLine!: ElementRef;
  @ViewChild('scrollText') scrollText!: ElementRef;
  @ViewChild('introSection') introSection!: ElementRef;
  @ViewChild('ellipseElement') ellipseElement!: ElementRef;

  constructor(
    @Inject(TranslationService) private translationService: TranslationService,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private typedAnimationService: TypedAnimationService,
    private renderer: Renderer2,
    private el: ElementRef, 
    private menuOverlayService: MenuOverlayService
  ) {}

  ngOnInit(): void {
    this.subscribeToLanguageChanges();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.startAnimations();
        this.initScrollAnimation();
        this.initTextColorChange();
      }, 200);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeFromLanguageChanges();
    this.typedAnimationService.destroyAllInstances();
    this.removeScrollListener();
    this.removeTextColorChangeListeners();
  }

  private subscribeToLanguageChanges(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe(lang => {
      this.selectedLanguage = lang;
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.startAnimations(), 100);
      }
    });
  }

  private unsubscribeFromLanguageChanges(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  private startAnimations(): void {
    this.clearPreviousAnimations();
    const animations = this.getAnimations();
    this.typedAnimationService.animateSequence(animations);
  }
  
  private clearPreviousAnimations(): void {
    this.typedAnimationService.destroyAllInstances();
  }
  
  private getAnimations(): Array<{ element: ElementRef, text: string, instanceId: string }> {
    return [
      { element: this.subtitleElement, text: this.getTranslatedText('intro.subtitle'), instanceId: 'intro-subtitle' },
      { element: this.titleElement1, text: this.getTranslatedText('intro.title1'), instanceId: 'intro-title1' },
      { element: this.titleElement2, text: this.getTranslatedText('intro.title2'), instanceId: 'intro-title2' }
    ];
  }
  
  private getTranslatedText(key: string): string {
    return this.translateService.instant(key);
  }

  private initScrollAnimation(): void {
    if (this.scrollBox && this.introSection) {
      this.introSectionHeight = this.introSection.nativeElement.offsetHeight;
      this.scrollBoxInitialPosition = this.scrollBox.nativeElement.offsetTop;
      
      this.findNextSectionOffset();
      this.addScrollListener();
    }
  }

  private findNextSectionOffset(): void {
    const nextSection = this.el.nativeElement.parentElement.querySelector('section:nth-child(2)');
    if (nextSection) {
      this.nextSectionOffset = nextSection.offsetTop;
    } else {
      this.nextSectionOffset = this.introSectionHeight;
    }
  }

  private addScrollListener(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.handleScroll);
      this.scrollAnimation = true;
    }
  }

  private removeScrollListener(): void {
    if (isPlatformBrowser(this.platformId) && this.scrollAnimation) {
      window.removeEventListener('scroll', this.handleScroll);
      this.scrollAnimation = false;
    }
  }

  @HostListener('window:scroll', [])
  private handleScroll = (): void => {
    if (!this.areElementsAvailable()) return;
    
    const scrollY = window.scrollY;
    const fadeThreshold = this.nextSectionOffset * this.fadeOutThreshold;
    
    this.moveScrollBox(scrollY, fadeThreshold);
    this.updateScrollLine(scrollY);
    this.updateScrollTextOpacity(scrollY, fadeThreshold);
    
    if (this.textColorChangeActive) {
      this.updateTextColors();
    }
  }
  
  private areElementsAvailable(): boolean {
    return !!(this.scrollBox && this.scrollLine && this.scrollText);
  }
  
  private moveScrollBox(scrollY: number, fadeThreshold: number): void {
    const scrollBoxElement = this.scrollBox.nativeElement;
    const translation = Math.min(scrollY * this.scrollMovementFactor, fadeThreshold * this.scrollMovementFactor);
    this.renderer.setStyle(scrollBoxElement, 'transform', `translateY(${translation}px)`);
  }
  
  private updateScrollLine(scrollY: number): void {
    const scrollLineElement = this.scrollLine.nativeElement;
    const lineHeight = this.introSectionHeight * 0.3056;
    const remainingLineHeight = Math.max(lineHeight - scrollY * this.scrollMovementFactor, 0);
    this.renderer.setStyle(scrollLineElement, 'height', `${remainingLineHeight}px`);
  }
  
  private updateScrollTextOpacity(scrollY: number, fadeThreshold: number): void {
    const scrollTextElement = this.scrollText.nativeElement;
    const textOpacity = Math.max(1 - (scrollY / fadeThreshold), 0);
    this.renderer.setStyle(scrollTextElement, 'opacity', textOpacity.toString());
  }
  
  private initTextColorChange(): void {
    if (isPlatformBrowser(this.platformId) && this.areTextElementsAvailable()) {
      if (this.isFeatureSupported()) {
        this.updateTextColors();
        this.addTextColorChangeListeners();
        this.textColorChangeActive = true;
      } else {
        this.setFallbackColors();
      }
    }
  }
  
  private areTextElementsAvailable(): boolean {
    return !!(this.subtitleElement && this.titleElement1 && this.titleElement2 && this.ellipseElement);
  }
  
  private addTextColorChangeListeners(): void {
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => {
        this.updateTextColors();
      });
      
      resizeObserver.observe(this.ellipseElement.nativeElement);
      resizeObserver.observe(this.subtitleElement.nativeElement);
      resizeObserver.observe(this.titleElement1.nativeElement);
      resizeObserver.observe(this.titleElement2.nativeElement);
    }
    
    window.addEventListener('resize', this.handleResize);
  }
  
  private removeTextColorChangeListeners(): void {
    if (isPlatformBrowser(this.platformId) && this.textColorChangeActive) {
      window.removeEventListener('resize', this.handleResize);
      this.textColorChangeActive = false;
    }
  }
  
  @HostListener('window:resize', [])
  private handleResize = (): void => {
    if (this.textColorChangeActive) {
      this.updateTextColors();
    }
  }
  
  private updateTextColors(): void {
    if (!this.areTextElementsAvailable()) return;
    
    const blueRect = this.ellipseElement.nativeElement.getBoundingClientRect();
    const textElements = [
      this.subtitleElement,
      this.titleElement1,
      this.titleElement2
    ];
    
    this.updateTextElementColors(textElements, blueRect);
  }
  
  private updateTextElementColors(elements: ElementRef[], blueRect: DOMRect): void {
    elements.forEach(textEl => {
      const textRect = textEl.nativeElement.getBoundingClientRect();
      const isOverlapping = this.isOverlapping(textRect, blueRect);
      const color = isOverlapping ? this.overlayTextColor : this.defaultTextColor;
      this.renderer.setStyle(textEl.nativeElement, 'color', color);
    });
  }
  
  private isOverlapping(rect1: DOMRect, rect2: DOMRect): boolean {
    const xOverlap = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
    const yOverlap = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
    const overlapArea = xOverlap * yOverlap;
    
    const textArea = rect1.width * rect1.height;
    const overlapRatio = textArea > 0 ? overlapArea / textArea : 0;
    
    return overlapRatio >= 0.2;
  }

  private isFeatureSupported(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    const hasResizeObserver = 'ResizeObserver' in window;
    const hasGetBoundingClientRect = typeof this.el.nativeElement.getBoundingClientRect === 'function';
    
    return hasResizeObserver && hasGetBoundingClientRect;
  }

  private setFallbackColors(): void {
    if (!this.areTextElementsAvailable()) return;
    
    const mediaQuery = window.matchMedia('(max-width: 424px)');
    const textElements = this.getTextElements();
    
    this.applyColorsBasedOnMediaQuery(mediaQuery, textElements);
    this.setupMediaQueryListener(mediaQuery, textElements);
  }
  
  private getTextElements(): ElementRef[] {
    return [
      this.subtitleElement,
      this.titleElement1,
      this.titleElement2
    ];
  }
  
  private applyColorsBasedOnMediaQuery(mediaQuery: MediaQueryList, elements: ElementRef[]): void {
    const textColor = mediaQuery.matches ? 'white' : this.defaultTextColor;
    elements.forEach(textEl => {
      this.renderer.setStyle(textEl.nativeElement, 'color', textColor);
    });
  }
  
  private setupMediaQueryListener(mediaQuery: MediaQueryList, elements: ElementRef[]): void {
    mediaQuery.addEventListener('change', (e) => {
      const newColor = e.matches ? 'white' : this.defaultTextColor;
      elements.forEach(textEl => {
        this.renderer.setStyle(textEl.nativeElement, 'color', newColor);
      });
    });
  }
}








