import { Component, OnInit, OnDestroy, Inject, ElementRef, ViewChild, AfterViewInit, PLATFORM_ID, Renderer2, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../../../core/services/translation-service/translation.service';
import { SocialButtonComponent } from '../../../../shared/components/social-button/social-button.component';
import { TypedAnimationService } from '../../../../core/services/typed-animation-service/typed-animation.service';
import { MenuOverlayComponent } from './menu-overlay/menu-overlay.component';
import { MenuOverlayService } from './../../../../core/services/menu-overlay-service/menu-overlay.service';
import { ProjectService } from '../../../../core/services/project-service/project.service';
import { TypedOptions } from './../../../../core/models/typed-options.interface';

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
   * @param projectService - Service providing utility methods for device detection and DOM manipulation
   */
  constructor(
    @Inject(TranslationService) private translationService: TranslationService,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private typedAnimationService: TypedAnimationService,
    private renderer: Renderer2,
    private el: ElementRef, 
    private menuOverlayService: MenuOverlayService,
    private projectService: ProjectService
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
      }, 500);
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
        this.typedAnimationService.destroyAllInstances();
        setTimeout(() => {
          this.startAnimations();
        }, 300);
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
  private async startAnimations(): Promise<void> {
    if (!this.areAnimationElementsAvailable()) {
      console.warn('Animation elements not yet available, retrying...');
      setTimeout(() => this.startAnimations(), 200);
      return;
    }
    this.clearPreviousAnimations();
    await this.projectService.delay(100);
    const animations = this.getAnimations();
    try {
      await this.typedAnimationService.animateSequence(animations);
    } catch (error) {
      console.error('Error in animation sequence:', error);
    }
  }

  /**
  * Checks if all animation elements are available.
  * 
  * @returns Boolean indicating whether required animation elements exist
  */
  private areAnimationElementsAvailable(): boolean {
    return !!(
      this.subtitleElement?.nativeElement &&
      this.titleElement1?.nativeElement &&
      this.titleElement2?.nativeElement
    );
  }
  
  /**
  * Clears all previous typing animations and prepares elements.
   */
  private clearPreviousAnimations(): void {
    this.typedAnimationService.destroyAllInstances();
    if (this.subtitleElement?.nativeElement) {
      this.subtitleElement.nativeElement.innerHTML = '';
    }
    if (this.titleElement1?.nativeElement) {
      this.titleElement1.nativeElement.innerHTML = '';
    }
    if (this.titleElement2?.nativeElement) {
      this.titleElement2.nativeElement.innerHTML = '';
    }
  }
  
  /**
   * Gets the configuration for all text animations.
  * 
  * @returns Array of animation configurations containing element references, text content, and instance IDs
  */
  private getAnimations(): Array<{ element: ElementRef, text: string, instanceId: string, options?: Partial<TypedOptions> }> {
    return [
      this.projectService.createAnimationConfig(this.subtitleElement, 'intro.subtitle', 'intro-subtitle', 60, this.translateService),
      this.projectService.createAnimationConfig(this.titleElement1, 'intro.title1', 'intro-title1', 70, this.translateService),
      this.projectService.createAnimationConfig(this.titleElement2, 'intro.title2', 'intro-title2', 70, this.translateService),
    ];
  }

  /**
   * Initializes scroll-based animations by measuring element positions
   * and setting up scroll event listeners.
   */
  private initScrollAnimation(): void {
    if (this.scrollBox && this.introSection) {
      this.introSectionHeight = this.introSection.nativeElement.offsetHeight;
      this.scrollBoxInitialPosition = this.scrollBox.nativeElement.offsetTop;
      
      this.nextSectionOffset = this.projectService.findNextSectionOffset(this.el, this.introSectionHeight);
      this.addScrollListener();
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
    
    this.projectService.moveScrollBox(this.scrollBox, this.renderer, scrollY, fadeThreshold, this.scrollMovementFactor);
    this.projectService.updateScrollLine(this.scrollLine, this.renderer, scrollY, this.introSectionHeight, this.scrollMovementFactor);
    this.projectService.updateScrollTextOpacity(this.scrollText, this.renderer, scrollY, fadeThreshold);
    
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
   * Initializes the text color change feature that updates text colors
   * based on overlapping with the ellipse element.
   */
  private initTextColorChange(): void {
    if (isPlatformBrowser(this.platformId) && this.areTextElementsAvailable()) {
      if (this.projectService.isFeatureSupported(this.el)) {
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
    const textElements = this.getTextElements();
    
    this.projectService.updateTextElementColors(textElements, blueRect, this.renderer);
  }

  /**
   * Sets fallback text colors based on media queries when dynamic color
   * change feature is not supported.
   */
  private setFallbackColors(): void {
    if (!this.areTextElementsAvailable()) return;
    
    const mediaQuery = window.matchMedia('(max-width: 424px)');
    const textElements = this.getTextElements();
    
    this.projectService.applyColorsBasedOnMediaQuery(mediaQuery, textElements, this.renderer);
    this.projectService.setupMediaQueryListener(mediaQuery, textElements, this.renderer);
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
}