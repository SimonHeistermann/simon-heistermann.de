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
  currentLang: string = 'de';
  private langSubscription!: Subscription;

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
}
