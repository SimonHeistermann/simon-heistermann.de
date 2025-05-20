import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Service responsible for managing application language settings and translations.
 * Uses ngx-translate and supports persistence via `localStorage` in the browser.
 */
@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLangSubject = new BehaviorSubject<string>('de');

  /**
   * Observable emitting the currently active language.
   */
  public currentLang$ = this.currentLangSubject.asObservable();

  /**
   * Initializes the service by setting up supported languages,
   * determining the initial language from localStorage or browser settings,
   * and applying it.
   *
   * @param translate - Instance of TranslateService for language handling
   * @param platformId - Platform identifier to check for browser environment
   */
  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.translate.addLangs(['de', 'en']);
    this.translate.setDefaultLang('de');

    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('preferredLanguage');
      const browserLang = this.translate.getBrowserLang();
      const initialLang =
        savedLang ||
        (browserLang && ['de', 'en'].includes(browserLang) ? browserLang : 'de');
      this.switchLanguage(initialLang);
    } else {
      this.switchLanguage('de');
    }
  }

  /**
   * Switches the active language used by the application and updates the state accordingly.
   * Persists the selected language in localStorage if in a browser environment.
   *
   * @param lang - The language code to switch to (e.g., 'de' or 'en')
   */
  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLangSubject.next(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('preferredLanguage', lang);
    }
  }
}

