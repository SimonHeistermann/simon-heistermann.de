import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../../core/services/translation-service/translation.service';
import { MouseFollowerComponent } from '../../../shared/components/mouse-follower/mouse-follower.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { MenuOverlayService } from '../../../core/services/menu-overlay-service/menu-overlay.service';
import { MenuOverlayComponent } from '../../portfolio/sections/intro/menu-overlay/menu-overlay.component';

/**
 * Component responsible for displaying the Privacy Policy page.
 * 
 * Handles language updates, integrates header and mouse follower UI components,
 * manages menu overlay state, and scrolls to the top on initialization.
 * 
 * Scrolling is performed only in the browser environment to avoid server-side rendering issues.
 */
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MouseFollowerComponent,
    HeaderComponent,
    MenuOverlayComponent
  ],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.sass']
})
export class PrivacyPolicyComponent implements OnInit, OnDestroy {
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
   * Subscription to the observable that emits language changes.
   */
  private langSubscription!: Subscription;

  /**
   * Subscription to the observable tracking the menu overlay state.
   */
  private overlaySubscription!: Subscription;

  /**
   * Creates an instance of PrivacyPolicyComponent.
   * 
   * @param translationService Service for translation management.
   * @param platformId Platform identifier injected to detect browser or server environment.
   * @param menuOverlayService Service for menu overlay state management.
   */
  constructor(
    private translationService: TranslationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private menuOverlayService: MenuOverlayService
  ) {}

  /**
   * Angular lifecycle hook called after component initialization.
   * 
   * Scrolls the window to the top smoothly when in a browser environment.
   * Subscribes to observables for language and menu overlay changes to update component state.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
   * Angular lifecycle hook called just before component destruction.
   * 
   * Cleans up subscriptions to avoid memory leaks.
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