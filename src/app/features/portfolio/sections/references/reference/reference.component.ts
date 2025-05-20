import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../../../../core/services/translation-service/translation.service';

@Component({
  selector: 'app-reference',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './reference.component.html',
  styleUrl: './reference.component.sass'
})
export class ReferenceComponent implements OnInit, OnDestroy {
  /**
   * Stores the current language code. Defaults to 'de'.
   */
  currentLang: string = 'de';

  /**
   * Subscription to listen for language changes.
   */
  private langSubscription!: Subscription;

  /**
   * Creates an instance of ReferenceComponent.
   * @param translationService The service managing translation data.
   */
  constructor(private translationService: TranslationService) {}

  /**
   * Angular lifecycle hook called when component is initialized.
   * Subscribes to the current language observable.
   */
  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  /**
   * Angular lifecycle hook called just before the component is destroyed.
   * Cleans up the subscription to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}