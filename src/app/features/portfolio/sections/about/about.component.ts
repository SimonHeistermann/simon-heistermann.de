import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslationService } from '../../../../core/services/translation-service/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.sass'
})
export class AboutComponent implements OnInit, OnDestroy {
  /** 
   * Holds the current language code. Default is 'de'.
   */
  currentLang: string = 'de';

  /** 
   * Subscription to language changes from TranslationService.
   */
  private langSubscription!: Subscription;

  /**
   * Creates an instance of AboutComponent.
   * @param translationService - Service to handle language translations.
   */
  constructor(private translationService: TranslationService) {}

  /**
   * Angular lifecycle hook that initializes the component.
   * Subscribes to current language changes.
   */
  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  /**
   * Angular lifecycle hook that cleans up before the component is destroyed.
   * Unsubscribes from the language subscription to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}