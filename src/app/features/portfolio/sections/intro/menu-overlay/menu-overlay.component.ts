import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { MenuOverlayService } from '../../../../../core/services/menu-overlay-service/menu-overlay.service';
import { fixateScrollingOnBody, releaseScrollOnBody } from '../../../../../shared/utils/scroll-lock.utils';
import { TranslationService } from '../../../../../core/services/translation-service/translation.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-menu-overlay',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './menu-overlay.component.html',
  styleUrl: './menu-overlay.component.sass'
})
export class MenuOverlayComponent implements OnInit, OnDestroy {
  isOverlayActive = false;
  selectedLanguage: string = 'de';

  private langSubscription!: Subscription;
  private subscription: Subscription = new Subscription();
  
  constructor(
    private menuOverlayService: MenuOverlayService,
    private translationService: TranslationService
  ) {}
  
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

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closeOverlay() {
    this.isOverlayActive = false;
    this.menuOverlayService.setMenuOverlayActive(false);
    releaseScrollOnBody();
  }

  selectLanguage(language: string): void {
    this.selectedLanguage = language;
    this.translationService.switchLanguage(language);
  }
}
