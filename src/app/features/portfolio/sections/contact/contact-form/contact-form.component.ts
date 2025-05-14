import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../../../core/services/translation-service/translation.service';
import { ContactService } from '../../../../../core/services/contact-service/contact.service';
import { ContactData } from '../../../../../core/models/contact-data.interface';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.sass',
})
export class ContactFormComponent implements OnInit, OnDestroy {
  contactForm!: FormGroup;
  currentLang: string = 'de';
  private langSubscription!: Subscription;
  submitting = false;
  submitSuccess = false;
  submitError = false;

  constructor(
    private fb: FormBuilder,
    private translationService: TranslationService,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      agreedToTerms: [false, [Validators.requiredTrue]],
      website: ['']
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      if (this.contactService.isSpamEntry(this.contactForm.get('website')?.value)) {
        return;
      }
      this.sendFormData();
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
  
  isFormValid(): boolean {
    return this.contactForm.valid;
  }
  
  sendFormData(): void {
    const contactData: ContactData = this.contactForm.value;
    this.submitting = true;
    
    this.contactService.sendContactData(contactData).subscribe({
      next: () => {
        this.submitSuccess = true;
        this.contactForm.reset();
      },
      error: (error) => {
        console.error('Fehler beim Senden des Formulars:', error);
        this.submitError = true;
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }
}

