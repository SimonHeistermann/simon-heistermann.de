import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, OnDestroy, Inject, ElementRef, ViewChild, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../../../core/services/translation-service/translation.service';
import { SocialButtonComponent } from '../../../../shared/components/social-button/social-button.component';
import { MouseFollowerComponent } from '../../../../shared/mouse-follower/mouse-follower.component';
import { TypedAnimationService } from '../../../../core/services/typed-animation-service/typed-animation.service';

@Component({
  selector: 'app-intro',
  imports: [CommonModule, TranslateModule, SocialButtonComponent, MouseFollowerComponent],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.sass'
})
export class IntroComponent implements OnInit, OnDestroy, AfterViewInit {
  selectedLanguage: string = 'de';
  private langSubscription!: Subscription;

  @ViewChild('animatedSubtitle') subtitleElement!: ElementRef;
  @ViewChild('animatedTitle1') titleElement1!: ElementRef;
  @ViewChild('animatedTitle2') titleElement2!: ElementRef;

  constructor(
    @Inject(TranslationService) private translationService: TranslationService,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private typedAnimationService: TypedAnimationService
  ) {}

  ngOnInit(): void {
    this.subscribeToLanguageChanges();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.startAnimations(), 200);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeFromLanguageChanges();
    this.typedAnimationService.destroyAllInstances();
  }

  private subscribeToLanguageChanges(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe(lang => {
      this.selectedLanguage = lang;
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.startAnimations(), 100);
      }
    });
  }

  private unsubscribeFromLanguageChanges(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  private startAnimations(): void {
    this.clearPreviousAnimations();
    const animations = this.getAnimations();
    this.typedAnimationService.animateSequence(animations);
  }
  
  private clearPreviousAnimations(): void {
    this.typedAnimationService.destroyAllInstances();
  }
  
  private getAnimations(): Array<{ element: ElementRef, text: string, instanceId: string }> {
    return [
      { element: this.subtitleElement, text: this.getTranslatedText('intro.subtitle'), instanceId: 'intro-subtitle' },
      { element: this.titleElement1, text: this.getTranslatedText('intro.title1'), instanceId: 'intro-title1' },
      { element: this.titleElement2, text: this.getTranslatedText('intro.title2'), instanceId: 'intro-title2' }
    ];
  }
  
  private getTranslatedText(key: string): string {
    return this.translateService.instant(key);
  }
  
  
}









