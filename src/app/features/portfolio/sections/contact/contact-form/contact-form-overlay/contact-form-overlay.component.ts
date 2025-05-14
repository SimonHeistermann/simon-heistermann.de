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
  currentLang: string = 'de';
  private langSubscription!: Subscription;

  @Input() submitting = false;
  @Input() submitSuccess = false;
  @Input() submitError = false;

  @Output() retry = new EventEmitter<void>();

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  onRetry(): void {
    this.retry.emit();
  }
}
