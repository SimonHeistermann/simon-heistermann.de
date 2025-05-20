import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../../../../../core/services/translation-service/translation.service';

@Component({
  standalone: true,
  selector: 'app-contact-form-overlay',
  imports: [CommonModule, TranslateModule],
  templateUrl: './contact-form-overlay.component.html',
  styleUrl: './contact-form-overlay.component.sass'
})
export class ContactFormOverlayComponent implements OnInit, OnDestroy {
  /**
   * Holds the current language code. Defaults to 'de'.
   */
  currentLang: string = 'de';

  /**
   * Subscription to observe language changes.
   */
  private langSubscription!: Subscription;

  /**
   * Indicates if the form submission is currently in progress.
   */
  @Input() submitting = false;

  /**
   * Indicates if the form submission was successful.
   */
  @Input() submitSuccess = false;

  /**
   * Indicates if there was an error during form submission.
   */
  @Input() submitError = false;

  /**
   * Event emitted when a retry action is triggered.
   */
  @Output() retry = new EventEmitter<void>();

  /**
   * Creates an instance of ContactFormOverlayComponent.
   * @param translationService - Service to handle translation and language changes.
   */
  constructor(private translationService: TranslationService) {}

  /**
   * Angular lifecycle hook to initialize the component.
   * Subscribes to language change observable.
   */
  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  /**
   * Angular lifecycle hook to clean up before the component is destroyed.
   * Unsubscribes from language subscription to avoid memory leaks.
   */
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  /**
   * Emits the retry event to signal a retry action.
   */
  onRetry(): void {
    this.retry.emit();
  }
}