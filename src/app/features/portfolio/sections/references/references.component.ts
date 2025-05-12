import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../../../core/services/translation-service/translation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-references',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './references.component.html',
  styleUrl: './references.component.sass'
})
export class ReferencesComponent implements OnInit, OnDestroy {
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
