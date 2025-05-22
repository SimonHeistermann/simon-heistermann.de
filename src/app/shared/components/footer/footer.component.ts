import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../../core/services/translation-service/translation.service';
import { ProjectService } from '../../../core/services/project-service/project.service';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.sass'
})
export class FooterComponent implements OnInit, OnDestroy {
  /**
   * Current language code, initialized to 'de' by default.
   */
  currentLang: string = 'de';

  /**
   * Subscription to listen for language changes.
   */
  private langSubscription!: Subscription;

  /**
   * Constructor to inject TranslationService.
   * @param translationService Service to handle language translations.
   */
  constructor(
    private translationService: TranslationService,
    private projectService: ProjectService
  ) {}

  /**
   * Angular lifecycle hook called on component initialization.
   * Subscribes to the current language observable to update `currentLang`.
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
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  /**
   * Navigates to home page
   * Uses project service for navigation
   */
  openHome() {
    this.projectService.navigateHome();
  }
}