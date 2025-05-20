import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../../../core/services/translation-service/translation.service';
import { Subscription } from 'rxjs';
import { ContactFormComponent } from './contact-form/contact-form.component';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, TranslateModule, ContactFormComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.sass'
})
export class ContactComponent implements OnInit, OnDestroy {
  /**
   * Holds the current language code. Default is 'de'.
   */
  currentLang: string = 'de';

  /**
   * Subscription to language changes from TranslationService.
   */
  private langSubscription!: Subscription;

  /**
   * Flag to disable scrolling during smooth scroll animation.
   */
  scrollDisabled: boolean = false;

  /**
   * Emits the form overlay status updates such as submitting state, success or error.
   */
  @Output() formOverlayStatus = new EventEmitter<{
    submitting: boolean;
    submitSuccess: boolean;
    submitError: boolean;
  }>();

  /**
   * Creates an instance of ContactComponent.
   * @param translationService - Service to handle language translations.
   */
  constructor(
    private translationService: TranslationService
  ) {}

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
    this.langSubscription?.unsubscribe();
  }

  /**
   * Smoothly scrolls the window to the top and disables scrolling until the top is reached.
   */
  scrollToTop(): void {
    this.scrollDisabled = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const checkScroll = () => {
      if (window.scrollY === 0) {
        this.scrollDisabled = false;
      } else {
        requestAnimationFrame(checkScroll);
      }
    };
    requestAnimationFrame(checkScroll);
  }

  /**
   * Emits the current form overlay status to the parent component.
   * @param status - The current status of the form overlay.
   */
  onFormStatusChange(status: { submitting: boolean; submitSuccess: boolean; submitError: boolean }): void {
    this.formOverlayStatus.emit(status);
  }
}