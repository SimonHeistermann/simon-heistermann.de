import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../../../core/services/translation-service/translation.service';
import { Subscription } from 'rxjs';
import { ReferenceComponent } from "./reference/reference.component";

@Component({
  selector: 'app-references',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReferenceComponent],
  templateUrl: './references.component.html',
  styleUrl: './references.component.sass'
})
export class ReferencesComponent implements OnInit, OnDestroy {
  /**
   * Holds the current language code. Defaults to 'de'.
   */
  currentLang: string = 'de';

  /**
   * Subscription to track language changes.
   */
  private langSubscription!: Subscription;

  /**
   * Creates an instance of ReferencesComponent.
   * @param translationService Service responsible for managing translations.
   */
  constructor(
    private translationService: TranslationService
  ) {}

  /**
   * Angular lifecycle hook called on component initialization.
   * Subscribes to language changes observable.
   */
  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  /**
   * Angular lifecycle hook called before component destruction.
   * Unsubscribes from the language subscription to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }
}