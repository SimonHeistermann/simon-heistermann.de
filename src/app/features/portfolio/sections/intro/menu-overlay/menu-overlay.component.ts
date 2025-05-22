import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Output, EventEmitter, OnInit, OnDestroy, Inject, PLATFORM_ID, Input } from '@angular/core';
import { MenuOverlayService } from '../../../../../core/services/menu-overlay-service/menu-overlay.service';
import { fixateScrollingOnBody, releaseScrollOnBody } from '../../../../../shared/utils/scroll-lock.utils';
import { TranslationService } from '../../../../../core/services/translation-service/translation.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectService } from '../../../../../core/services/project-service/project.service';

/**
 * Menu Overlay Component
 * 
 * A standalone Angular component that manages an application menu overlay.
 * Handles menu state, language selection, and navigation actions.
 */
@Component({
  selector: 'app-menu-overlay',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './menu-overlay.component.html',
  styleUrl: './menu-overlay.component.sass'
})
export class MenuOverlayComponent implements OnInit, OnDestroy {
  /** Flag indicating whether the overlay is currently active */
  isOverlayActive = false;
  
  /** Currently selected language code */
  selectedLanguage: string = 'de';

  /** Subscription for language changes */
  private langSubscription!: Subscription;
  
  /** Subscription for menu overlay state changes */
  private subscription: Subscription = new Subscription();

  /**
  * Input flag to determine if simple navigation should be used.
  * When `true`, navigation triggers a full page reload to the section.
  * When `false`, navigation uses smooth scrolling within the page.
  */
  @Input() isSimpleNavigation = false;
  
  /**
   * Creates an instance of MenuOverlayComponent.
   * 
   * @param menuOverlayService - Service to manage menu overlay state
   * @param translationService - Service for language translation management
   * @param projectService - Service for project navigation
   * @param platformId - Angular's platform identifier token for browser detection
   */
  constructor(
    private menuOverlayService: MenuOverlayService,
    private translationService: TranslationService,
    private projectService: ProjectService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  
  /**
   * Lifecycle hook that is called after component initialization.
   * Subscribes to overlay state changes and language changes.
   */
  ngOnInit(): void {
    this.subscription = this.menuOverlayService.menuOverlayActive$.subscribe(
      isActive => {
        this.isOverlayActive = isActive;
      }
    );
    this.langSubscription = this.translationService.currentLang$.subscribe(lang => {
      this.selectedLanguage = lang;
    });
  }

  /**
   * Lifecycle hook that is called when component is destroyed.
   * Unsubscribes from all active subscriptions to prevent memory leaks.
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
   * Closes the menu overlay and re-enables scrolling on the body.
   */
  closeOverlay() {
    this.isOverlayActive = false;
    this.menuOverlayService.setMenuOverlayActive(false);
    releaseScrollOnBody();
  }

  /**
   * Switches the application language.
   * 
   * @param language - Language code to switch to
   */
  selectLanguage(language: string): void {
    this.selectedLanguage = language;
    this.translationService.switchLanguage(language);
  }

  /**
   * Navigates to the home page via the project service.
   */
  openHome() {
    this.projectService.navigateHome();
  }

  /**
  * Navigates to a specific section on the page.
  * 
  * Closes any active overlay before navigation.
  * 
  * If running outside the browser (e.g., server-side), navigation is aborted.
  * 
  * Depending on the `isSimpleNavigation` flag, navigation either triggers a full page reload 
  * with the hash fragment or performs a smooth scroll to the target section.
  * 
  * @param sectionId The ID of the target section to navigate to.
  */
  navigateTo(sectionId: string): void {
    this.closeOverlay();
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.isSimpleNavigation) {
      this.navigateWithPageReload(sectionId);
    } else {
      this.smoothScrollToSection(sectionId);
    }
  }

  /**
  * Navigates by reloading the page with the hash URL pointing to the specified section.
  * 
  * @param sectionId The ID of the section to navigate to.
  */
  private navigateWithPageReload(sectionId: string): void {
    window.location.href = `/#${sectionId}`;
  }

  /**
   * Smoothly scrolls the viewport to the specified section element after a short delay.
  * 
  * @param sectionId The ID of the section element to scroll to.
  */
  private smoothScrollToSection(sectionId: string): void {
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  }
}
