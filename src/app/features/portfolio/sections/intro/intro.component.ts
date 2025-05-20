import { Component, OnInit, OnDestroy, Inject, ElementRef, ViewChild, AfterViewInit, PLATFORM_ID, Renderer2, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../../../core/services/translation-service/translation.service';
import { SocialButtonComponent } from '../../../../shared/components/social-button/social-button.component';
import { TypedAnimationService } from '../../../../core/services/typed-animation-service/typed-animation.service';
import { MenuOverlayComponent } from './menu-overlay/menu-overlay.component';
import { MenuOverlayService } from './../../../../core/services/menu-overlay-service/menu-overlay.service';

/**
 * Introduction Component
 * 
 * A complex Angular component that handles the intro section of the application,
 * featuring animated text, scroll-based animations, text color changes based on
 * element overlapping, and menu overlay integration.
 */
@Component({
  selector: 'app-intro',
  imports: [CommonModule, TranslateModule, SocialButtonComponent, MenuOverlayComponent],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.sass'
})
export class IntroComponent implements OnInit, OnDestroy, AfterViewInit {
  /** Currently selected language code */
  selectedLanguage: string = 'de';
  
  /** Subscription for language changes */
  private langSubscription!: Subscription;
  
  /** Flag indicating whether scroll animation is active */
  private scrollAnimation: boolean = false;
  
  /** Height of the intro section in pixels */
  private introSectionHeight: number = 0;
  
  /** Vertical offset position of the next section in pixels */
  private nextSectionOffset: number = 0;
  
  /** Initial vertical position of the scroll box in pixels */
  private scrollBoxInitialPosition: number = 0;
  
  /** Factor determining the speed of scroll movement */
  private scrollMovementFactor: number = 0.4;
  
  /** Threshold determining when elements start to fade out (0-1) */
  private fadeOutThreshold: number = 0.85;
  
  /** Flag indicating whether text color change feature is active */
  private textColorChangeActive: boolean = false;
  
  /** Default text color (CSS variable) */
  private defaultTextColor: string = 'var(--color-primary)';
  
  /** Text color when overlapping with the ellipse element */
  private overlayTextColor: string = 'white';

  /** Flag indicating whether the menu overlay is active */
  isOverlayActive = false;
  
  /** Collection of active subscriptions */
  private subscription: Subscription = new Subscription();

  /** Reference to the animated subtitle element */
  @ViewChild('animatedSubtitle') subtitleElement!: ElementRef;
  
  /** Reference to the first animated title element */
  @ViewChild('animatedTitle1') titleElement1!: ElementRef;
  
  /** Reference to the second animated title element */
  @ViewChild('animatedTitle2') titleElement2!: ElementRef;
  
  /** Reference to the scroll box element */
  @ViewChild('scrollBox') scrollBox!: ElementRef;
  
  /** Reference to the scroll line element */
  @ViewChild('scrollLine') scrollLine!: ElementRef;
  
  /** Reference to the scroll text element */
  @ViewChild('scrollText') scrollText!: ElementRef;
  
  /** Reference to the intro section element */
  @ViewChild('introSection') introSection!: ElementRef;
  
  /** Reference to the ellipse element that affects text color */
  @ViewChild('ellipseElement') ellipseElement!: ElementRef;

  /**
   * Creates an instance of IntroComponent.
   * 
   * @param translationService - Service for managing language translations
   * @param translateService - Service for translating text keys
   * @param platformId - Angular's platform identifier token for browser detection
   * @param typedAnimationService - Service for creating typing animations
   * @param renderer - Angular's renderer for DOM manipulation
   * @param el - Reference to the component's host element
   * @param menuOverlayService - Service to manage menu overlay state
   */
  constructor(
    @Inject(TranslationService) private translationService: TranslationService,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private typedAnimationService: TypedAnimationService,
    private renderer: Renderer2,
    private el: ElementRef, 
    private menuOverlayService: MenuOverlayService
  ) {}

  /**
   * Lifecycle hook that is called after component initialization.
   * Sets up language change and menu overlay state subscriptions.
   */
  ngOnInit(): void {
    this.subscribeToLanguageChanges();
    this.subscription = this.menuOverlayService.menuOverlayActive$.subscribe(
      isActive => {
        this.isOverlayActive = isActive;
      }
    );
  }

  /**
   * Lifecycle hook that is called after the component's view has been initialized.
   * Initializes animations, scroll behaviors, and text color change functionality.
   */
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.startAnimations();
        this.initScrollAnimation();
        this.initTextColorChange();
      }, 200);
    }
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Cleans up all subscriptions, animations, and event listeners.
   */
  ngOnDestroy(): void {
    this.unsubscribeFromLanguageChanges();
    this.typedAnimationService.destroyAllInstances();
    this.removeScrollListener();
    this.removeTextColorChangeListeners();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Subscribes to language change events and updates animations when language changes.
   */
  private subscribeToLanguageChanges(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe(lang => {
      this.selectedLanguage = lang;
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.startAnimations(), 100);
      }
    });
  }

  /**
   * Unsubscribes from language change events to prevent memory leaks.
   */
  private unsubscribeFromLanguageChanges(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  /**
   * Starts the typing animations sequence for title and subtitle elements.
   * Clears previous animations before starting new ones.
   */
  private startAnimations(): void {
    this.clearPreviousAnimations();
    const animations = this.getAnimations();
    this.typedAnimationService.animateSequence(animations);
  }
  
  /**
   * Clears all previous typing animations.
   */
  private clearPreviousAnimations(): void {
    this.typedAnimationService.destroyAllInstances();
  }
  
  /**
   * Gets the configuration for all text animations.
   * 
   * @returns Array of animation configurations containing element references, text content, and instance IDs
   */
  private getAnimations(): Array<{ element: ElementRef, text: string, instanceId: string }> {
    return [
      { element: this.subtitleElement, text: this.getTranslatedText('intro.subtitle'), instanceId: 'intro-subtitle' },
      { element: this.titleElement1, text: this.getTranslatedText('intro.title1'), instanceId: 'intro-title1' },
      { element: this.titleElement2, text: this.getTranslatedText('intro.title2'), instanceId: 'intro-title2' }
    ];
  }
  
  /**
   * Gets translated text for a given translation key.
   * 
   * @param key - Translation key to retrieve
   * @returns Translated text string
   */
  private getTranslatedText(key: string): string {
    return this.translateService.instant(key);
  }

  /**
   * Initializes scroll-based animations by measuring element positions
   * and setting up scroll event listeners.
   */
  private initScrollAnimation(): void {
    if (this.scrollBox && this.introSection) {
      this.introSectionHeight = this.introSection.nativeElement.offsetHeight;
      this.scrollBoxInitialPosition = this.scrollBox.nativeElement.offsetTop;
      
      this.findNextSectionOffset();
      this.addScrollListener();
    }
  }

  /**
   * Finds the vertical offset position of the next section in the document.
   */
  private findNextSectionOffset(): void {
    const nextSection = this.el.nativeElement.parentElement.querySelector('section:nth-child(2)');
    if (nextSection) {
      this.nextSectionOffset = nextSection.offsetTop;
    } else {
      this.nextSectionOffset = this.introSectionHeight;
    }
  }

  /**
   * Adds the scroll event listener to handle scroll-based animations.
   */
  private addScrollListener(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.handleScroll);
      this.scrollAnimation = true;
    }
  }

  /**
   * Removes the scroll event listener to clean up resources.
   */
  private removeScrollListener(): void {
    if (isPlatformBrowser(this.platformId) && this.scrollAnimation) {
      window.removeEventListener('scroll', this.handleScroll);
      this.scrollAnimation = false;
    }
  }

  /**
   * Handles window scroll events to update scroll-based animations.
   * Updates scroll box position, scroll line height, text opacity, 
   * and text colors based on current scroll position.
   */
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
  
  /**
   * Checks if all necessary scroll elements are available in the DOM.
   * 
   * @returns Boolean indicating whether required elements exist
   */
  private areElementsAvailable(): boolean {
    return !!(this.scrollBox && this.scrollLine && this.scrollText);
  }
  
  /**
   * Moves the scroll box element based on scroll position.
   * 
   * @param scrollY - Current vertical scroll position in pixels
   * @param fadeThreshold - Threshold position for maximum movement
   */
  private moveScrollBox(scrollY: number, fadeThreshold: number): void {
    const scrollBoxElement = this.scrollBox.nativeElement;
    const translation = Math.min(scrollY * this.scrollMovementFactor, fadeThreshold * this.scrollMovementFactor);
    this.renderer.setStyle(scrollBoxElement, 'transform', `translateY(${translation}px)`);
  }
  
  /**
   * Updates the scroll line height based on scroll position.
   * 
   * @param scrollY - Current vertical scroll position in pixels
   */
  private updateScrollLine(scrollY: number): void {
    const scrollLineElement = this.scrollLine.nativeElement;
    const lineHeight = this.introSectionHeight * 0.3056;
    const remainingLineHeight = Math.max(lineHeight - scrollY * this.scrollMovementFactor, 0);
    this.renderer.setStyle(scrollLineElement, 'height', `${remainingLineHeight}px`);
  }
  
  /**
   * Updates the scroll text opacity based on scroll position.
   * 
   * @param scrollY - Current vertical scroll position in pixels
   * @param fadeThreshold - Threshold position for complete fade-out
   */
  private updateScrollTextOpacity(scrollY: number, fadeThreshold: number): void {
    const scrollTextElement = this.scrollText.nativeElement;
    const textOpacity = Math.max(1 - (scrollY / fadeThreshold), 0);
    this.renderer.setStyle(scrollTextElement, 'opacity', textOpacity.toString());
  }
  
  /**
   * Initializes the text color change feature that updates text colors
   * based on overlapping with the ellipse element.
   */
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
  
  /**
   * Checks if all text elements are available in the DOM.
   * 
   * @returns Boolean indicating whether required text elements exist
   */
  private areTextElementsAvailable(): boolean {
    return !!(this.subtitleElement && this.titleElement1 && this.titleElement2 && this.ellipseElement);
  }
  
  /**
   * Adds ResizeObserver and window resize listeners for dynamic text color updates.
   */
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
  
  /**
   * Removes text color change event listeners to clean up resources.
   */
  private removeTextColorChangeListeners(): void {
    if (isPlatformBrowser(this.platformId) && this.textColorChangeActive) {
      window.removeEventListener('resize', this.handleResize);
      this.textColorChangeActive = false;
    }
  }
  
  /**
   * Handles window resize events to update text colors.
   */
  @HostListener('window:resize', [])
  private handleResize = (): void => {
    if (this.textColorChangeActive) {
      this.updateTextColors();
    }
  }
  
  /**
   * Updates text colors based on their overlap with the ellipse element.
   */
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
  
  /**
   * Updates the color of each text element based on its overlap with the ellipse.
   * 
   * @param elements - Array of text element references to update
   * @param blueRect - Bounding rectangle of the ellipse element
   */
  private updateTextElementColors(elements: ElementRef[], blueRect: DOMRect): void {
    elements.forEach(textEl => {
      const textRect = textEl.nativeElement.getBoundingClientRect();
      const isOverlapping = this.isOverlapping(textRect, blueRect);
      const color = isOverlapping ? this.overlayTextColor : this.defaultTextColor;
      this.renderer.setStyle(textEl.nativeElement, 'color', color);
    });
  }
  
  /**
   * Determines if two DOM rectangles are overlapping by a significant amount.
   * 
   * @param rect1 - First DOM rectangle (typically a text element)
   * @param rect2 - Second DOM rectangle (typically the ellipse)
   * @returns Boolean indicating significant overlap (>= 20% of text area)
   */
  private isOverlapping(rect1: DOMRect, rect2: DOMRect): boolean {
    const xOverlap = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
    const yOverlap = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
    const overlapArea = xOverlap * yOverlap;
    
    const textArea = rect1.width * rect1.height;
    const overlapRatio = textArea > 0 ? overlapArea / textArea : 0;
    
    return overlapRatio >= 0.2;
  }

  /**
   * Checks if required browser features for text color changes are supported.
   * 
   * @returns Boolean indicating whether required features are available
   */
  private isFeatureSupported(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    const hasResizeObserver = 'ResizeObserver' in window;
    const hasGetBoundingClientRect = typeof this.el.nativeElement.getBoundingClientRect === 'function';
    
    return hasResizeObserver && hasGetBoundingClientRect;
  }

  /**
   * Sets fallback text colors based on media queries when dynamic color
   * change feature is not supported.
   */
  private setFallbackColors(): void {
    if (!this.areTextElementsAvailable()) return;
    
    const mediaQuery = window.matchMedia('(max-width: 424px)');
    const textElements = this.getTextElements();
    
    this.applyColorsBasedOnMediaQuery(mediaQuery, textElements);
    this.setupMediaQueryListener(mediaQuery, textElements);
  }
  
  /**
   * Gets an array of all text element references.
   * 
   * @returns Array of text element references
   */
  private getTextElements(): ElementRef[] {
    return [
      this.subtitleElement,
      this.titleElement1,
      this.titleElement2
    ];
  }
  
  /**
   * Applies text colors based on a media query match.
   * 
   * @param mediaQuery - Media query to evaluate
   * @param elements - Array of text element references to update
   */
  private applyColorsBasedOnMediaQuery(mediaQuery: MediaQueryList, elements: ElementRef[]): void {
    const textColor = mediaQuery.matches ? 'white' : this.defaultTextColor;
    elements.forEach(textEl => {
      this.renderer.setStyle(textEl.nativeElement, 'color', textColor);
    });
  }
  
  /**
   * Sets up a media query change listener for fallback text color updates.
   * 
   * @param mediaQuery - Media query to monitor
   * @param elements - Array of text element references to update on changes
   */
  private setupMediaQueryListener(mediaQuery: MediaQueryList, elements: ElementRef[]): void {
    mediaQuery.addEventListener('change', (e) => {
      const newColor = e.matches ? 'white' : this.defaultTextColor;
      elements.forEach(textEl => {
        this.renderer.setStyle(textEl.nativeElement, 'color', newColor);
      });
    });
  }
}