import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLangSubject = new BehaviorSubject<string>('de');
  public currentLang$ = this.currentLangSubject.asObservable();

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.translate.addLangs(['de', 'en']);
    this.translate.setDefaultLang('de');
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('preferredLanguage');
      const browserLang = this.translate.getBrowserLang();
      const initialLang = savedLang || 
                         (browserLang && ['de', 'en'].includes(browserLang) ? browserLang : 'de');
      this.switchLanguage(initialLang);
    } else {
      this.switchLanguage('de');
    }
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLangSubject.next(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('preferredLanguage', lang);
    }
  }
}
