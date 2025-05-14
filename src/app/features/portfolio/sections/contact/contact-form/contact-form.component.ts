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

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, ContactFormOverlayComponent],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.sass',
})
export class ContactFormComponent implements OnInit, OnDestroy {
  contactForm!: FormGroup;
  currentLang: string = 'de';
  private langSubscription!: Subscription;

  private overlayPreviouslyShown = false;
  
  submitting = false;
  submitSuccess = false;
  submitError = false;

  @Output() formStatusChange = new EventEmitter<{
    submitting: boolean;
    submitSuccess: boolean;
    submitError: boolean;
  }>();

  constructor(
    private fb: FormBuilder,
    private translationService: TranslationService,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.initLanguageSubscription();
    this.initContactForm();
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }

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

  private initLanguageSubscription(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });
  }

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
      website: [''] 
    });
  }

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
  
  private isFormValid(): boolean {
    return this.contactForm.valid;
  }
  
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

  private handleSuccessfulSubmission(): void {
    this.submitSuccess = true;
    this.emitFormStatus();
    this.contactForm.reset();
    setTimeout(() => {
      this.submitSuccess = false;
      this.emitFormStatus();
    }, 3000);
  }

  private handleFailedSubmission(error: any): void {
    console.error('Fehler beim Senden des Formulars:', error);
    this.submitError = true;
    this.emitFormStatus();
    setTimeout(() => {
      this.submitError = false;
      this.emitFormStatus();
    }, 3000);
  }

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

  private emitFormStatus(): void {
    this.formStatusChange.emit({
      submitting: this.submitting,
      submitSuccess: this.submitSuccess,
      submitError: this.submitError,
    });
  }
  
}
