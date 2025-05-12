import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
}
