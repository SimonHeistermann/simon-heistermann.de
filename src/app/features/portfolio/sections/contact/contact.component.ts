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
  currentLang: string = 'de';
  private langSubscription!: Subscription;
  scrollDisabled: boolean = false;

  @Output() formOverlayStatus = new EventEmitter<{
    submitting: boolean;
    submitSuccess: boolean;
    submitError: boolean;
  }>();

  constructor(
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }

  scrollToTop() {
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

  onFormStatusChange(status: { submitting: boolean; submitSuccess: boolean; submitError: boolean }) {
    this.formOverlayStatus.emit(status);
  }
}
