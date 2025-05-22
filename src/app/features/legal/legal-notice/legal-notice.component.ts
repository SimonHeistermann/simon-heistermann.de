import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../../core/services/translation-service/translation.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { MouseFollowerComponent } from '../../../shared/components/mouse-follower/mouse-follower.component';
import { MenuOverlayService } from '../../../core/services/menu-overlay-service/menu-overlay.service';
import { MenuOverlayComponent } from '../../portfolio/sections/intro/menu-overlay/menu-overlay.component';

/**
 * Component responsible for displaying the Legal Notice (Impressum) page.
 * 
 * Manages language changes, menu overlay state, and ensures UI components are integrated.
 * Automatically scrolls to the top of the page when initialized, only if running in the browser.
 */
@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    HeaderComponent,
    MouseFollowerComponent,
    MenuOverlayComponent
  ],
  templateUrl: './legal-notice.component.html',
  styleUrls: ['./legal-notice.component.sass']
})
export class LegalNoticeComponent implements OnInit, OnDestroy {
  /**
   * The current active language code.
   * Defaults to 'de' (German).
   */
  currentLang: string = 'de';

  /**
  * Flag indicating whether the component should use simple navigation mode.
  * When `true`, the UI renders a simplified navigation experience.
  */
  isSimpleNavigation = true;

  /**
   * Indicates whether the menu overlay is currently active.
   */
  isOverlayActive = false;

  /**
   * Subscription to the language change observable from TranslationService.
   */
  private langSubscription!: Subscription;

  /**
   * Subscription to the menu overlay state observable from MenuOverlayService.
   */
  private overlaySubscription!: Subscription;

  /**
   * Creates an instance of LegalNoticeComponent.
   * 
   * @param translationService Service for managing translations and current language.
   * @param platformId Injected platform identifier to detect if running on browser or server.
   * @param menuOverlayService Service to manage the state of the menu overlay.
   */
  constructor(
    private translationService: TranslationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private menuOverlayService: MenuOverlayService,
    private ngZone: NgZone
  ) {}

  /**
   * Angular lifecycle hook that runs after component initialization.
   * 
   * Scrolls the window to the top smoothly if running in a browser.
   * Subscribes to language and menu overlay observables to keep component state updated.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 0);
      });
    }
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
    this.overlaySubscription = this.menuOverlayService.menuOverlayActive$.subscribe(
      (isActive: boolean) => {
        this.isOverlayActive = isActive;
      }
    );
  }

  /**
   * Angular lifecycle hook that runs just before the component is destroyed.
   * 
   * Unsubscribes from all active subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (this.overlaySubscription) {
      this.overlaySubscription.unsubscribe();
    }
  }
}