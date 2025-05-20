import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../../../core/services/translation-service/translation.service';
import { ContactService } from '../../../../../core/services/contact-service/contact.service';
import { ContactData } from '../../../../../core/models/contact-data.interface';
import { fixateScrollingOnBody, releaseScrollOnBody } from '../../../../../shared/utils/scroll-lock.utils';
import { ContactFormOverlayComponent } from './contact-form-overlay/contact-form-overlay.component';

/**
 * Contact form component that handles user contact requests.
 * 
 * This component provides a form for users to submit contact information and messages.
 * It includes validation, spam protection, and overlay state management for form submission feedback.
 */
@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, ContactFormOverlayComponent],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.sass',
})
export class ContactFormComponent implements OnInit, OnDestroy {
  /** The form group containing all form controls for contact submission */
  contactForm!: FormGroup;
  
  /** The current language code being used in the application */
  currentLang: string = 'de';
  
  /** Subscription to language changes to be cleaned up on component destruction */
  private langSubscription!: Subscription;

  /** Tracks whether overlay was shown in previous change detection cycle */
  private overlayPreviouslyShown = false;
  
  /** Flag indicating whether the form is currently being submitted */
  submitting = false;
  
  /** Flag indicating whether the form was successfully submitted */
  submitSuccess = false;
  
  /** Flag indicating whether an error occurred during form submission */
  submitError = false;

  /**
   * Event emitter that notifies parent components about form status changes
   * 
   * @event formStatusChange Emits an object containing current form status flags
   */
  @Output() formStatusChange = new EventEmitter<{
    submitting: boolean;
    submitSuccess: boolean;
    submitError: boolean;
  }>();

  /**
   * Creates an instance of ContactFormComponent.
   * 
   * @param fb - FormBuilder service to create reactive forms
   * @param translationService - Service for handling translations and language changes
   * @param contactService - Service for submitting contact form data to backend
   */
  constructor(
    private fb: FormBuilder,
    private translationService: TranslationService,
    private contactService: ContactService
  ) {}

  /**
   * Lifecycle hook that initializes the component.
   * Sets up language subscription and initializes the contact form.
   */
  ngOnInit(): void {
    this.initLanguageSubscription();
    this.initContactForm();
  }

  /**
   * Lifecycle hook that cleans up subscriptions when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }

  /**
   * Lifecycle hook that runs during change detection.
   * Manages body scroll locking based on overlay visibility state.
   */
  ngDoCheck(): void {
    const overlayCurrentlyShown = this.submitting || this.submitSuccess || this.submitError;
    if (overlayCurrentlyShown && !this.overlayPreviouslyShown) {
      fixateScrollingOnBody();
    }
    if (!overlayCurrentlyShown && this.overlayPreviouslyShown) {
      releaseScrollOnBody();
    }
    this.overlayPreviouslyShown = overlayCurrentlyShown;
  }

  /**
   * Initializes subscription to language changes from the translation service.
   * Updates the currentLang property when language changes.
   * 
   * @private
   */
  private initLanguageSubscription(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });
  }

  /**
   * Initializes the contact form with form controls and validators.
   * 
   * @private
   */
  private initContactForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(2)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      message: ['', [
        Validators.required, 
        Validators.minLength(10)
      ]],
      agreedToTerms: [false, [
        Validators.requiredTrue
      ]],
      website: [''] // Honeypot field for spam detection
    });
  }

  /**
   * Handles form submission when user submits the contact form.
   * Validates the form, checks for spam, and sends data to backend if valid.
   */
  onSubmit(): void {
    if (this.submitting) {
      return;
    }
    this.submitError = false;
    if (this.isFormValid()) {
      if (this.contactService.isSpamEntry(this.contactForm.get('website')?.value)) {
        this.simulateSuccessfulSubmission();
        return;
      }
      this.sendFormData();
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
  
  /**
   * Checks if the form is valid.
   * 
   * @private
   * @returns True if the form passes all validations, false otherwise
   */
  private isFormValid(): boolean {
    return this.contactForm.valid;
  }
  
  /**
   * Sends the form data to the backend using the contact service.
   * Updates submission status flags and handles response.
   * 
   * @private
   */
  private sendFormData(): void {
    const contactData: ContactData = this.contactForm.value;
    this.submitting = true;
    this.emitFormStatus();
    this.contactService.sendContactData(contactData).subscribe({
      next: () => {
        this.handleSuccessfulSubmission();
      },
      error: (error) => {
        this.handleFailedSubmission(error);
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }

  /**
   * Handles successful form submission.
   * Updates status flags, resets the form, and schedules cleanup.
   * 
   * @private
   */
  private handleSuccessfulSubmission(): void {
    this.submitSuccess = true;
    this.emitFormStatus();
    this.contactForm.reset();
    setTimeout(() => {
      this.submitSuccess = false;
      this.emitFormStatus();
    }, 3000);
  }

  /**
   * Handles failed form submission.
   * Logs error, updates status flags, and schedules cleanup.
   * 
   * @private
   * @param error - The error returned from the contact service
   */
  private handleFailedSubmission(error: any): void {
    console.error('Fehler beim Senden des Formulars:', error);
    this.submitError = true;
    this.emitFormStatus();
    setTimeout(() => {
      this.submitError = false;
      this.emitFormStatus();
    }, 3000);
  }

  /**
   * Simulates a successful submission when spam is detected.
   * This prevents spambots from knowing their submission was rejected.
   * 
   * @private
   */
  private simulateSuccessfulSubmission(): void {
    this.submitting = true;
    this.emitFormStatus();
    setTimeout(() => {
      this.submitting = false;
      this.emitFormStatus();
      this.submitSuccess = true;
      this.emitFormStatus();
      this.contactForm.reset();
      setTimeout(() => {
        this.submitSuccess = false;
        this.emitFormStatus();
      }, 5000);
    }, 1000);
  }

  /**
   * Emits the current form status to parent components.
   * 
   * @private
   */
  private emitFormStatus(): void {
    this.formStatusChange.emit({
      submitting: this.submitting,
      submitSuccess: this.submitSuccess,
      submitError: this.submitError,
    });
  }
}