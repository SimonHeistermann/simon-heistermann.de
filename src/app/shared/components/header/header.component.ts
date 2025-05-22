import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslationService } from '../../../core/services/translation-service/translation.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { MenuOverlayService } from '../../../core/services/menu-overlay-service/menu-overlay.service';
import { fixateScrollingOnBody, releaseScrollOnBody } from '../../utils/scroll-lock.utils';
import { ProjectService } from '../../../core/services/project-service/project.service';
import { Router } from '@angular/router';

/**
 * Header component responsible for displaying the site header
 * Features include:
 * - Auto-hiding based on scroll position
 * - Language selection
 * - Responsive mouse position tracking
 * - Menu overlay integration
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass'],
  animations: [
    trigger('initialLoad', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('600ms cubic-bezier(0.33, 1, 0.68, 1)', style({ transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  /** Flag to control header visibility */
  isHeaderHidden = false;
  
  /** Tracks if user is hovering over the header */
  isHoveredHeader = false;
  
  /** Indicates if user has scrolled beyond threshold */
  hasScrolled = false; 
  
  /** Tracks if mouse cursor is near the top of the page */
  isMouseNearTop = false;
  
  /** Controls initial animation display */
  shouldShowInitialAnimation: boolean = true;
  
  /** Tracks if this is initial page load */
  initialPageLoad: boolean = true;
  
  /** Indicates if page loaded with scroll position below threshold */
  pageLoadedWithScroll: boolean = false;
  
  /** Controls immediate hiding of header (no animation) */
  isHeaderHiddenImmediate = false;

  /** When true, always applies hover style regardless of other conditions */
  @Input() alwaysShowHoverStyle: boolean = false;
  
  /** Last recorded scroll position */
  private lastScrollTop = 0;
  
  /** Distance from top of viewport to consider mouse "near top" (in pixels) */
  private readonly MOUSE_THRESHOLD = 120;
  
  /** Scroll position threshold to consider page "scrolled" (in pixels) */
  private readonly SCROLL_THRESHOLD = 60;
  
  /** Flag indicating if code is running in browser environment */
  private isBrowser: boolean;
  
  /** Currently selected language code */
  selectedLanguage: string = 'de';

  /** Subscription to language changes */
  private langSubscription!: Subscription;

  /** Flag indicating if contact overlay is currently active */
  @Input() isContactOverlayActive: boolean = false;
  
  /** Flag indicating if menu overlay is currently active */
  menuOverlayActive = false;
  
  /** Collection of all subscriptions for proper cleanup */
  private subscription: Subscription = new Subscription();

  /**
  * Platform identifier used to determine whether the code is running
  * in a browser or on the server (for platform-specific behavior).
  */
  private platformId: Object;

  /**
  * Input flag to control navigation behavior.
  * 
  * When `true`, navigation uses a full page reload with hash-based anchors.
  * When `false`, navigation performs smooth in-page scrolling.
  */
  @Input() isSimpleNavigation: boolean = false;

  /**
   * Creates an instance of HeaderComponent
   * @param platformId - Injection token to determine platform environment
   * @param translationService - Service for handling language translations
   * @param menuOverlayService - Service for controlling menu overlay state
   * @param projectService - Service for navigation control
   */
  constructor(
    @Inject(PLATFORM_ID) platformId: Object, 
    private translationService: TranslationService,
    private menuOverlayService: MenuOverlayService,
    private projectService: ProjectService,
    private router: Router
  ) {
    this.platformId = platformId;
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Lifecycle hook that initializes component
   * Sets up initial state and subscriptions
   */
  ngOnInit(): void {
    if (this.isBrowser) {
      const scrollTop = this.getScrollTop();
      this.hasScrolled = scrollTop >= this.SCROLL_THRESHOLD;
      this.pageLoadedWithScroll = this.hasScrolled;
      this.lastScrollTop = scrollTop;
      this.shouldShowInitialAnimation = scrollTop < this.SCROLL_THRESHOLD;
      this.checkScrollPosition();
    }
    
    this.langSubscription = this.translationService.currentLang$.subscribe(lang => {
      this.selectedLanguage = lang;
    });

    this.subscription = this.menuOverlayService.menuOverlayActive$.subscribe(isActive => { 
      this.menuOverlayActive = isActive;
      if(this.isBrowser) this.checkScrollPosition();
    });
  }

  /**
   * Checks current scroll position and updates header visibility state
   * Takes into account various conditions including overlays and mouse position
   */
  private checkScrollPosition(): void {
    const scrollTop = this.getScrollTop();
    this.hasScrolled = scrollTop >= this.SCROLL_THRESHOLD;
    const shouldForceHide = this.isContactOverlayActive || this.menuOverlayActive;
    this.isHeaderHiddenImmediate = shouldForceHide;
    if (shouldForceHide) {
      this.isHeaderHidden = true;
      return;
    }
    if (this.initialPageLoad && this.pageLoadedWithScroll) {
      this.isHeaderHidden = false;
    } else {
      this.isHeaderHidden = this.hasScrolled && !this.isMouseNearTop && !this.isHoveredHeader;
    }
  }
  
  /**
   * Host listener for scroll events
   * Updates header state based on scroll position changes
   */
  @HostListener('window:scroll')
  handleScroll(): void {
    if (!this.isBrowser) return;
    if (this.initialPageLoad) {
      this.initialPageLoad = false;
    }
    this.checkScrollPosition();
    this.lastScrollTop = this.getScrollTop();
  }

  /**
   * Host listener for mouse movement
   * Tracks if mouse is near the top of the viewport
   * @param event - Mouse movement event
   */
  @HostListener('document:mousemove', ['$event'])
  handleMouseMove(event: MouseEvent): void {
    if (!this.isBrowser) return;
    const wasNearTop = this.isMouseNearTop;
    this.isMouseNearTop = event.clientY < this.MOUSE_THRESHOLD;
    if (wasNearTop !== this.isMouseNearTop) {
      this.checkScrollPosition();
    }
  }

  /**
   * Lifecycle hook for component destruction
   * Cleans up all subscriptions
   */
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Gets current scroll position in a cross-browser compatible way
   * @returns Current scroll position in pixels
   */
  private getScrollTop(): number {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }  

  /**
   * Handles language selection
   * Updates current language and notifies translation service
   * @param language - Language code to switch to
   */
  selectLanguage(language: string): void {
    this.selectedLanguage = language;
    this.translationService.switchLanguage(language);
  }

  /**
   * Event handler for mouse enter on header
   * Updates hover state if overlays are not forcing header to hide
   */
  onHeaderMouseEnter(): void {
    const shouldForceHide = !this.isContactOverlayActive || !this.menuOverlayActive;
    if (shouldForceHide) {
      this.isHoveredHeader = true;
    }
  }

  /**
   * Event handler for mouse leave on header
   * Resets hover state
   */
  onHeaderMouseLeave(): void {
    this.isHoveredHeader = false;
  }

  /**
   * Determines if hover style should be applied to header
   * Based on scroll state, mouse position, and custom settings
   * @returns Boolean indicating if hover style should be applied
   */
  shouldApplyHoverStyle(): boolean {
    if (this.alwaysShowHoverStyle) return true;
    return (
      (this.initialPageLoad && this.pageLoadedWithScroll) ||
      (this.hasScrolled && (this.isHoveredHeader || this.isMouseNearTop))
    );
  }

  /**
   * Opens the menu overlay
   * Updates overlay state and fixes body scrolling
   */
  openOverlay() {
    this.menuOverlayActive = true;
    this.menuOverlayService.setMenuOverlayActive(true);
    fixateScrollingOnBody();
  }

  /**
   * Navigates to home page
   * Uses project service for navigation
   */
  openHome() {
    this.projectService.navigateHome();
  }

  async scrollToSection(event: Event, sectionId: string): Promise<void> {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.isSimpleNavigation) {
      const navigated = await this.projectService.navigateHome();
      if (navigated && this.router.url === '/') {
        setTimeout(() => this.smoothScrollToSection(sectionId), 300);
      }
    } else {
      this.smoothScrollToSection(sectionId);
    }
  }

  /**
  * Smoothly scrolls to the specified section within the current page.
  * Accounts for a fixed vertical offset (e.g., header height).
  * 
  * @param sectionId The ID of the DOM element to scroll to.
  */
  private smoothScrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (!element) return;
    const yOffset = 117;
    const y = element.getBoundingClientRect().top + window.scrollY - yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

