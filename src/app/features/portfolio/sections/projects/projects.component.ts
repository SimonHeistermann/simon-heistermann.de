import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ElementRef, ViewChild, Renderer2, AfterViewInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { ProjectComponent } from './project/project.component';
import { Project } from '../../../../core/models/project.interface';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../../../../core/services/firebase-service/firebase.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-projects',
  imports: [CommonModule, ProjectComponent],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.sass']
})
export class ProjectsComponent implements OnInit, OnDestroy, AfterViewInit {
  projects: Project[] = [];
  private projectsSubscription!: Subscription;

  private scrollAnimation: boolean = false;
  private introSectionHeight: number = 0;
  private scrollBoxInitialPosition: number = 0;

  private animationStartOffset: number = 500; // px before the section comes into view
  private animationDuration: number = 800; // How many pixels of scrolling to complete the animation
  private scrollLineMaxHeightPx: number = 400; // Fixed height in pixels for the scroll line
  private scrollTextFadeInSpeed: number = 3; // Higher = faster fade-in (text appears earlier)
  
  @ViewChild('scrollBox') scrollBox!: ElementRef;
  @ViewChild('scrollLine') scrollLine!: ElementRef;
  @ViewChild('scrollText') scrollText!: ElementRef;
  @ViewChild('projectsSection') projectsSection!: ElementRef;

  constructor(private firebaseService: FirebaseService, 
    private renderer: Renderer2, private el: ElementRef, @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.projectsSubscription = this.firebaseService.projects$.subscribe((projects: Project[]) => {
      this.projects = projects;
    });
  }

  ngOnDestroy(): void {
    this.projectsSubscription?.unsubscribe();
    this.removeScrollListener();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.resetScrollElements();
        this.initScrollAnimation();
      }, 200);
    }
  }

  private initScrollAnimation(): void {
    if (this.scrollBox && this.projectsSection) {
      this.introSectionHeight = this.projectsSection.nativeElement.offsetHeight;
      this.scrollBoxInitialPosition = this.scrollBox.nativeElement.offsetTop;
      this.resetScrollElements();
      this.addScrollListener();
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

  private calculateSmoothProgress(rawProgress: number): number {
    const clampedProgress = Math.min(Math.max(rawProgress, 0), 1);
    if (clampedProgress < 1) {
      const t = 1 - clampedProgress;
      return 1 - (t * t * t);
    }
    return 1;
  }

  private updateScrollText(scrollProgress: number): void {
    const scrollTextElement = this.scrollText.nativeElement;
    const opacity = Math.min(scrollProgress * this.scrollTextFadeInSpeed, 1);
    this.renderer.setStyle(scrollTextElement, 'opacity', opacity.toString());
  }

  private updateScrollLine(scrollProgress: number): void {
    const scrollLineElement = this.scrollLine.nativeElement;
    const currentHeight = scrollProgress * this.scrollLineMaxHeightPx;
    this.renderer.setStyle(scrollLineElement, 'height', `${currentHeight}px`);
  }

  private resetScrollElements(): void {
    if (this.scrollLine) {
      this.renderer.setStyle(this.scrollLine.nativeElement, 'height', '0px');
    }
    if (this.scrollText) {
      this.renderer.setStyle(this.scrollText.nativeElement, 'opacity', '0');
    }
  }

  private areElementsAvailable(): boolean {
    return !!(this.scrollBox && this.scrollLine && this.scrollText && this.projectsSection);
  }
}


