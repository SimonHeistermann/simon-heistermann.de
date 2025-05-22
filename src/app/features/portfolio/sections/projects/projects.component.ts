import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ElementRef, ViewChild, Renderer2, AfterViewInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { ProjectComponent } from './project/project.component';
import { Project } from '../../../../core/models/project.interface';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../../../../core/services/firebase-service/firebase.service';
import { isPlatformBrowser } from '@angular/common';
import { TranslationService } from '../../../../core/services/translation-service/translation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-projects',
  imports: [CommonModule, ProjectComponent, TranslateModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.sass']
})
export class ProjectsComponent implements OnInit, OnDestroy, AfterViewInit {
  /** List of projects fetched from Firebase */
  projects: Project[] = [];
  
  /** Subscription to the projects observable */
  private projectsSubscription!: Subscription;

  /** Flag to track if scroll animation listener is active */
  private scrollAnimation: boolean = false;
  
  /** Height of the intro section (projects section) */
  private introSectionHeight: number = 0;
  
  /** Initial top offset position of the scroll box element */
  private scrollBoxInitialPosition: number = 0;

  /** Offset from top of viewport where animation starts */
  private animationStartOffset: number = 500; 
  
  /** Duration (in pixels scrolled) over which the animation runs */
  private animationDuration: number = 800;
  
  /** Maximum height in pixels for the scroll line animation */
  private scrollLineMaxHeightPx: number = 400;
  
  /** Speed multiplier for the scroll text fade-in effect */
  private scrollTextFadeInSpeed: number = 3;
  
  /** Reference to the scroll box element */
  @ViewChild('scrollBox') scrollBox!: ElementRef;
  
  /** Reference to the scroll line element */
  @ViewChild('scrollLine') scrollLine!: ElementRef;
  
  /** Reference to the scroll text element */
  @ViewChild('scrollText') scrollText!: ElementRef;
  
  /** Reference to the projects section element */
  @ViewChild('projectsSection') projectsSection!: ElementRef;

  /** Currently selected language code */
  selectedLanguage: string = 'de';

  /** Subscription to language changes */
  private langSubscription!: Subscription;

  /**
   * Constructor injecting required services and platform identifier.
   * @param firebaseService Service to fetch projects data
   * @param renderer Angular Renderer2 to manipulate DOM safely
   * @param el ElementRef for the host element
   * @param platformId Platform identifier to check if running in browser
   * @param translationService Custom translation service managing language changes.
   * @param translateService ngx-translate service for translations.
   */
  constructor(
    private firebaseService: FirebaseService, 
    private renderer: Renderer2, 
    private el: ElementRef, 
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(TranslationService) private translationService: TranslationService,
    private translateService: TranslateService,
  ) {}

  /**
   * OnInit lifecycle hook to subscribe to projects data stream.
   */
  ngOnInit(): void {
    this.projectsSubscription = this.firebaseService.projects$.subscribe((projects: Project[]) => {
      this.projects = projects;
    });
    this.langSubscription = this.translationService.currentLang$.subscribe(lang => {
      this.selectedLanguage = lang;
    });
  }

  /**
   * OnDestroy lifecycle hook to unsubscribe from projects stream and remove scroll listener.
   */
  ngOnDestroy(): void {
    this.projectsSubscription?.unsubscribe();
    this.removeScrollListener();
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  /**
   * AfterViewInit lifecycle hook to initialize scroll animation if running in browser.
   */
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.resetScrollElements();
        this.initScrollAnimation();
      }, 200);
    }
  }

  /**
   * Initializes scroll animation by setting up measurements and adding scroll listener.
   */
  private initScrollAnimation(): void {
    if (this.scrollBox && this.projectsSection) {
      this.introSectionHeight = this.projectsSection.nativeElement.offsetHeight;
      this.scrollBoxInitialPosition = this.scrollBox.nativeElement.offsetTop;
      this.resetScrollElements();
      this.addScrollListener();
    }
  }

  /**
   * Adds a scroll event listener to window for animating on scroll.
   */
  private addScrollListener(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.handleScroll);
      this.scrollAnimation = true;
    }
  }

  /**
   * Removes the scroll event listener from window to stop animation.
   */
  private removeScrollListener(): void {
    if (isPlatformBrowser(this.platformId) && this.scrollAnimation) {
      window.removeEventListener('scroll', this.handleScroll);
      this.scrollAnimation = false;
    }
  }

  /**
   * Handles the window scroll event to update animations based on scroll position.
   */
  @HostListener('window:scroll', [])
  private handleScroll = (): void => {
    if (!this.areElementsAvailable()) return;
    const scrollY = window.scrollY;
    const sectionRect = this.projectsSection.nativeElement.getBoundingClientRect();
    const sectionTop = sectionRect.top + window.scrollY;
    const relativeScrollY = scrollY - (sectionTop - this.animationStartOffset);
    if (relativeScrollY >= 0) {
      const scrollProgress = this.calculateSmoothProgress(relativeScrollY / this.animationDuration);
      this.updateScrollText(scrollProgress);
      this.updateScrollLine(scrollProgress);
    } else {
      this.resetScrollElements();
    }
  }

  /**
   * Calculates a smooth eased progress value for the animation.
   * @param rawProgress Raw linear progress between 0 and 1
   * @returns Eased progress value
   */
  private calculateSmoothProgress(rawProgress: number): number {
    const clampedProgress = Math.min(Math.max(rawProgress, 0), 1);
    if (clampedProgress < 1) {
      const t = 1 - clampedProgress;
      return 1 - (t * t * t);
    }
    return 1;
  }

  /**
   * Updates the scroll text opacity based on the animation progress.
   * @param scrollProgress Progress value between 0 and 1
   */
  private updateScrollText(scrollProgress: number): void {
    const scrollTextElement = this.scrollText.nativeElement;
    const opacity = Math.min(scrollProgress * this.scrollTextFadeInSpeed, 1);
    this.renderer.setStyle(scrollTextElement, 'opacity', opacity.toString());
  }

  /**
   * Updates the height of the scroll line element based on the animation progress.
   * @param scrollProgress Progress value between 0 and 1
   */
  private updateScrollLine(scrollProgress: number): void {
    const scrollLineElement = this.scrollLine.nativeElement;
    const currentHeight = scrollProgress * this.scrollLineMaxHeightPx;
    this.renderer.setStyle(scrollLineElement, 'height', `${currentHeight}px`);
  }

  /**
   * Resets scroll animation elements to their initial states.
   */
  private resetScrollElements(): void {
    if (this.scrollLine) {
      this.renderer.setStyle(this.scrollLine.nativeElement, 'height', '0px');
    }
    if (this.scrollText) {
      this.renderer.setStyle(this.scrollText.nativeElement, 'opacity', '0');
    }
  }

  /**
   * Checks if all required DOM elements are available before animation.
   * @returns True if all elements are defined, false otherwise
   */
  private areElementsAvailable(): boolean {
    return !!(this.scrollBox && this.scrollLine && this.scrollText && this.projectsSection);
  }
}