import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../../core/services/translation-service/translation.service';
import { MouseFollowerComponent } from '../../../shared/components/mouse-follower/mouse-follower.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';

/**
 * Component that displays the privacy policy page.
 * 
 * Manages translation updates and includes header and mouse follower components.
 */
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, TranslateModule, MouseFollowerComponent, HeaderComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.sass'
})
export class PrivacyPolicyComponent implements OnInit, OnDestroy {
  /** The currently active language, default is 'de'. */
  currentLang: string = 'de';

  /** Subscription to observe language changes. */
  private langSubscription!: Subscription;

  /**
   * Creates an instance of PrivacyPolicyComponent.
   * @param translationService Service to manage and observe current language.
   */
  constructor(private translationService: TranslationService) {}

  /**
   * Subscribes to language changes when component initializes.
   */
  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  /**
   * Unsubscribes from language changes on component destruction to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}