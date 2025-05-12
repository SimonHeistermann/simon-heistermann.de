import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../../../core/services/translation-service/translation.service';
import { ContactMessage } from '../../../../../core/models/contact-message.interface';

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

  constructor(
    private fb: FormBuilder,
    private translationService: TranslationService
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
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const message: ContactMessage = this.contactForm.value;
      console.log('Formular erfolgreich abgesendet:', message);
      // TODO: Sende Daten an API
      this.contactForm.reset();
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}

