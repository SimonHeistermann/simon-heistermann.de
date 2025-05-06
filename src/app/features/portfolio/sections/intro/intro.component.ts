import { Component, OnInit, OnDestroy, Inject, ElementRef, ViewChild, AfterViewInit, PLATFORM_ID, Renderer2, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../../../core/services/translation-service/translation.service';
import { SocialButtonComponent } from '../../../../shared/components/social-button/social-button.component';
import { TypedAnimationService } from '../../../../core/services/typed-animation-service/typed-animation.service';

@Component({
  selector: 'app-intro',
  imports: [CommonModule, TranslateModule, SocialButtonComponent],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.sass'
})
export class IntroComponent implements OnInit, OnDestroy, AfterViewInit {
  selectedLanguage: string = 'de';
  private langSubscription!: Subscription;
  private scrollAnimation: boolean = false;
  private introSectionHeight: number = 0;
  private nextSectionOffset: number = 0;
  private scrollBoxInitialPosition: number = 0;
  
  private scrollMovementFactor: number = 0.4;
  private fadeOutThreshold: number = 0.85;

  @ViewChild('animatedSubtitle') subtitleElement!: ElementRef;
  @ViewChild('animatedTitle1') titleElement1!: ElementRef;
  @ViewChild('animatedTitle2') titleElement2!: ElementRef;
  @ViewChild('scrollBox') scrollBox!: ElementRef;
  @ViewChild('scrollLine') scrollLine!: ElementRef;
  @ViewChild('scrollText') scrollText!: ElementRef;
  @ViewChild('introSection') introSection!: ElementRef;

  constructor(
    @Inject(TranslationService) private translationService: TranslationService,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private typedAnimationService: TypedAnimationService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.subscribeToLanguageChanges();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.startAnimations();
        this.initScrollAnimation();
      }, 200);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeFromLanguageChanges();
    this.typedAnimationService.destroyAllInstances();
    this.removeScrollListener();
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

  private initScrollAnimation(): void {
    if (this.scrollBox && this.introSection) {
      this.introSectionHeight = this.introSection.nativeElement.offsetHeight;
      this.scrollBoxInitialPosition = this.scrollBox.nativeElement.offsetTop;
      
      this.findNextSectionOffset();
      this.addScrollListener();
    }
  }

  private findNextSectionOffset(): void {
    const nextSection = this.el.nativeElement.parentElement.querySelector('section:nth-child(2)');
    if (nextSection) {
      this.nextSectionOffset = nextSection.offsetTop;
    } else {
      this.nextSectionOffset = this.introSectionHeight;
    }
  }

  private addScrollListener(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.handleScroll);
      this.scrollAnimation = true;
    }
  }

  private removeScrollListener(): void {
    if (isPlatformBrowser(this.platformId) && this.scrollAnimation) {
      window.removeEventListener('scroll', this.handleScroll);
      this.scrollAnimation = false;
    }
  }

  @HostListener('window:scroll', [])
  private handleScroll = (): void => {
    if (!this.areElementsAvailable()) return;
    
    const scrollY = window.scrollY;
    const fadeThreshold = this.nextSectionOffset * this.fadeOutThreshold;
    
    this.moveScrollBox(scrollY, fadeThreshold);
    this.updateScrollLine(scrollY);
    this.updateScrollTextOpacity(scrollY, fadeThreshold);
  }
  
  private areElementsAvailable(): boolean {
    return !!(this.scrollBox && this.scrollLine && this.scrollText);
  }
  
  private moveScrollBox(scrollY: number, fadeThreshold: number): void {
    const scrollBoxElement = this.scrollBox.nativeElement;
    const translation = Math.min(scrollY * this.scrollMovementFactor, fadeThreshold * this.scrollMovementFactor);
    this.renderer.setStyle(scrollBoxElement, 'transform', `translateY(${translation}px)`);
  }
  
  private updateScrollLine(scrollY: number): void {
    const scrollLineElement = this.scrollLine.nativeElement;
    const lineHeight = this.introSectionHeight * 0.3056;
    const remainingLineHeight = Math.max(lineHeight - scrollY * this.scrollMovementFactor, 0);
    this.renderer.setStyle(scrollLineElement, 'height', `${remainingLineHeight}px`);
  }
  
  private updateScrollTextOpacity(scrollY: number, fadeThreshold: number): void {
    const scrollTextElement = this.scrollText.nativeElement;
    const textOpacity = Math.max(1 - (scrollY / fadeThreshold), 0);
    this.renderer.setStyle(scrollTextElement, 'opacity', textOpacity.toString());
  }
}









