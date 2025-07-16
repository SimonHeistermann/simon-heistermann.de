import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  /**
   * Index of the reference entry used to construct translation keys (e.g., 1, 2, 3).
   */
  @Input() index!: number;

  /**
   * Stores the current language code. Defaults to 'de'.
   */
  currentLang: string = 'de';

  /**
   * Subscription to listen for language changes.
   */
  private langSubscription!: Subscription;

  /**
   * Creates an instance of ReferenceComponent.
   * @param translationService The service managing translation data.
   */
  constructor(private translationService: TranslationService) {}

  /**
   * Angular lifecycle hook called when the component is initialized.
   * Subscribes to the language change observable.
   */
  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  /**
   * Angular lifecycle hook called just before the component is destroyed.
   * Cleans up the subscription to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }

  /**
   * Returns the translation key for the given field using the current index.
   *
   * @param field The field name (e.g., 'name', 'project', 'text').
   * @returns A string representing the full translation key.
   *
   * Example: for index = 2 and field = 'name', returns 'references.2.name'
   */
  getTranslationKey(field: string): string {
    return `references.${this.index}.${field}`;
  }
}