import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../../core/services/translation-service/translation.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { MouseFollowerComponent } from '../../../shared/components/mouse-follower/mouse-follower.component';

/**
 * Component displaying the legal notice (Impressum) page.
 * 
 * Handles translation updates and integrates header and mouse follower UI components.
 */
@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [CommonModule, TranslateModule, HeaderComponent, MouseFollowerComponent],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.sass'
})
export class LegalNoticeComponent implements OnInit, OnDestroy {
  /** Holds the currently active language, defaulting to 'de'. */
  currentLang: string = 'de';

  /** Subscription to language change observable. */
  private langSubscription!: Subscription;

  /**
   * Creates an instance of LegalNoticeComponent.
   * @param translationService Service used to observe and manage the current language.
   */
  constructor(private translationService: TranslationService) {}

  /**
   * Subscribes to language changes on component initialization.
   */
  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  /**
   * Unsubscribes from the language observable to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}

