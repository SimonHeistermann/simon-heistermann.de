import { Component, OnInit, OnDestroy, Inject, ElementRef, ViewChild, AfterViewInit, PLATFORM_ID, Renderer2, HostListener } from '@angular/core';
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

@Component({
  selector: 'app-intro',
  imports: [CommonModule, TranslateModule, SocialButtonComponent, MenuOverlayComponent],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.sass'
})
export class IntroComponent implements OnInit, OnDestroy, AfterViewInit {
  /** Currently selected language code */
  selectedLanguage: string = 'de';

  /** Subscription to language changes */
  private langSubscription!: Subscription;

  /** Flag to indicate if scroll animation is active */
  private scrollAnimation: boolean = false;

  /** Height of the intro section element */
  private introSectionHeight: number = 0;

  /** Scroll offset position of the next section */
  private nextSectionOffset: number = 0;

  /** Initial offset top position of the scroll box element */
  private scrollBoxInitialPosition: number = 0;

  /** Factor controlling the movement speed of the scroll box */
  private scrollMovementFactor: number = 0.4;

  /** Threshold value to trigger fade out effect */
  private fadeOutThreshold: number = 0.85;

  /** Whether the menu overlay is currently active */
  isOverlayActive = false;

  /** Subscription to menu overlay state */
  private subscription: Subscription = new Subscription();

  /** Reference to the subtitle element for animation */
  @ViewChild('animatedSubtitle') subtitleElement!: ElementRef;

  /** Reference to the first title element for animation */
  @ViewChild('animatedTitle1') titleElement1!: ElementRef;

  /** Reference to the second title element for animation */
  @ViewChild('animatedTitle2') titleElement2!: ElementRef;

  /** Reference to the scroll box element used in scroll animation */
  @ViewChild('scrollBox') scrollBox!: ElementRef;

  /** Reference to the scroll line element used in scroll animation */
  @ViewChild('scrollLine') scrollLine!: ElementRef;

  /** Reference to the scroll text element used in scroll animation */
  @ViewChild('scrollText') scrollText!: ElementRef;

  /** Reference to the intro section container element */
  @ViewChild('introSection') introSection!: ElementRef;

  /**
   * Constructor with dependency injection.
   * @param translationService Custom translation service managing language changes.
   * @param translateService ngx-translate service for translations.
   * @param platformId Angular platform ID for platform detection.
   * @param typedAnimationService Service to handle typed text animations.
   * @param renderer Renderer2 for DOM manipulation.
   * @param el Reference to the component's host element.
   * @param menuOverlayService Service to observe menu overlay state.
   * @param projectService Service for project related utilities and helpers.
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
   * Angular lifecycle hook: Called once after the component is initialized.
   * Subscribes to language changes and menu overlay state.
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
   * Angular lifecycle hook: Called after the component's view has been fully initialized.
   * Starts animations and initializes scroll animation on the browser platform.
   */
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.startAnimations();
        this.initScrollAnimation();
      }, 500);
    }
  }

  /**
   * Angular lifecycle hook: Called just before the component is destroyed.
   * Cleans up subscriptions, destroys animation instances and removes event listeners.
   */
  ngOnDestroy(): void {
    this.unsubscribeFromLanguageChanges();
    this.typedAnimationService.destroyAllInstances();
    this.removeScrollListener();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Subscribes to language change observable to update selected language and restart animations.
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
   * Unsubscribes from the language change observable to prevent memory leaks.
   */
  private unsubscribeFromLanguageChanges(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  /**
   * Starts the typed text animations sequentially.
   * Retries if animation elements are not yet available.
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
   * Checks if all required elements for animations are available in the DOM.
   * @returns True if subtitle and both title elements are present, false otherwise.
   */
  private areAnimationElementsAvailable(): boolean {
    return !!(
      this.subtitleElement?.nativeElement &&
      this.titleElement1?.nativeElement &&
      this.titleElement2?.nativeElement
    );
  }

  /**
   * Clears the content and destroys any previous animation instances.
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
   * Creates the animation configuration objects for each animated element.
   * @returns Array of animation configuration objects with element references, translation keys and options.
   */
  private getAnimations(): Array<{ element: ElementRef, text: string, instanceId: string, options?: Partial<TypedOptions> }> {
    return [
      this.projectService.createAnimationConfig(this.subtitleElement, 'intro.subtitle', 'intro-subtitle', 60, this.translateService),
      this.projectService.createAnimationConfig(this.titleElement1, 'intro.title1', 'intro-title1', 70, this.translateService),
      this.projectService.createAnimationConfig(this.titleElement2, 'intro.title2', 'intro-title2', 70, this.translateService),
    ];
  }

  /**
   * Initializes parameters for scroll animation and adds scroll event listener.
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
   * Adds the scroll event listener if running on browser platform.
   */
  private addScrollListener(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.handleScroll);
      this.scrollAnimation = true;
    }
  }

  /**
   * Removes the scroll event listener if it was previously added.
   */
  private removeScrollListener(): void {
    if (isPlatformBrowser(this.platformId) && this.scrollAnimation) {
      window.removeEventListener('scroll', this.handleScroll);
      this.scrollAnimation = false;
    }
  }

  /**
   * Scroll event handler that updates the scroll box position, line length and text opacity.
   * Uses project service utilities for the DOM manipulations.
   */
  @HostListener('window:scroll', [])
  private handleScroll = (): void => {
    if (!this.areElementsAvailable()) return;
    
    const scrollY = window.scrollY;
    const fadeThreshold = this.nextSectionOffset * this.fadeOutThreshold;
    
    this.projectService.moveScrollBox(this.scrollBox, this.renderer, scrollY, fadeThreshold, this.scrollMovementFactor);
    this.projectService.updateScrollLine(this.scrollLine, this.renderer, scrollY, this.introSectionHeight, this.scrollMovementFactor);
    this.projectService.updateScrollTextOpacity(this.scrollText, this.renderer, scrollY, fadeThreshold);
  }
  
  /**
   * Checks if scroll related elements are available in the DOM.
   * @returns True if scrollBox, scrollLine and scrollText elements are present.
   */
  private areElementsAvailable(): boolean {
    return !!(this.scrollBox && this.scrollLine && this.scrollText);
  }
}