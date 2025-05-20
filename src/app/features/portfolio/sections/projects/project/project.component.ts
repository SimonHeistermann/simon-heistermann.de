import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from '../../../../../core/models/project.interface';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../../../../../core/services/firebase-service/firebase.service';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../../../../core/services/translation-service/translation.service';
import { UserInteractionService } from '../../../../../core/services/user-interaction-service/user-interaction.service';

/**
 * Component to display project information with interactive video preview functionality.
 * Supports different layouts and handles video autoplay on hover with fallback strategies.
 */
@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.sass'
})
export class ProjectComponent implements OnInit, OnDestroy {
  /** Project data to be displayed */
  @Input() project!: Project;
  
  /** Layout configuration for the component. Can be either 'left' or 'right' */
  @Input() layout: 'left' | 'right' = 'left';
  
  /** Flag indicating whether the user is currently hovering over the component */
  isHovering = false;
  
  /** Current language code for localization */
  currentLang: string = 'de';
  
  /** Subscription for language changes */
  private langSubscription!: Subscription;
  
  /** Subscription for user interaction events */
  private interactionSubscription!: Subscription;
  
  /** Flag indicating whether the user has interacted with the page */
  private userHasInteracted = false;
  
  /** Reference to the video element for controlling playback */
  @ViewChild('videoPlayer', { static: false }) videoPlayer?: ElementRef<HTMLVideoElement>;
  
  /** Flag to track if the video has been preloaded */
  private videoPreloaded = false;

  /**
   * Creates an instance of ProjectComponent.
   * 
   * @param router - Angular router service for navigation
   * @param firebaseService - Service for Firebase operations
   * @param translationService - Service for handling translations
   * @param userInteractionService - Service tracking user interactions
   * @param platformId - Injection token for platform identification
   */
  constructor(
    private router: Router, 
    private firebaseService: FirebaseService, 
    private translationService: TranslationService,
    private userInteractionService: UserInteractionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Lifecycle hook that is called after component initialization.
   * Sets up subscriptions, validates inputs, and initializes video preloading.
   */
  ngOnInit(): void {
    this.initSubscriptions();
    this.validateProjectInput();
    this.initializeVideoPreloading();
  }

  /**
   * Initializes all subscriptions required by the component.
   * @private
   */
  private initSubscriptions(): void {
    this.subscribeToLanguageChanges();
    this.subscribeToUserInteractions();
  }

  /**
   * Sets up subscription to language change events.
   * @private
   */
  private subscribeToLanguageChanges(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  /**
   * Sets up subscription to user interaction events.
   * @private
   */
  private subscribeToUserInteractions(): void {
    this.interactionSubscription = this.userInteractionService.hasInteracted$.subscribe(hasInteracted => {
      this.userHasInteracted = hasInteracted;
    });
  }

  /**
   * Validates that the required project input has been provided.
   * @private
   */
  private validateProjectInput(): void {
    if (!this.project) {
      console.error('Project input is required!');
    }
  }

  /**
   * Initializes video preloading if a video URL is available.
   * @private
   */
  private initializeVideoPreloading(): void {
    if (this.project?.videoUrl) {
      this.preloadVideo();
    }
  }

  /**
   * Preloads the project video for smoother playback on hover.
   * Only executes in browser environments and if not already preloaded.
   * @private
   */
  private preloadVideo(): void {
    if (this.videoPreloaded || !this.project.videoUrl || !this.isBrowserEnvironment()) {
      return;
    }
    
    const video = document.createElement('video');
    this.configurePreloadVideo(video);
  }

  /**
   * Configures the video element for preloading.
   * 
   * @param video - The HTML video element to configure
   * @private
   */
  private configurePreloadVideo(video: HTMLVideoElement): void {
    video.preload = 'auto';
    video.muted = true;
    video.src = this.project.videoUrl;
    video.load();
    video.onloadeddata = () => {
      this.videoPreloaded = true;
    };
  }
  
  /**
   * Checks if the code is running in a browser environment.
   * 
   * @returns True if running in a browser, false otherwise
   * @private
   */
  private isBrowserEnvironment(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Cleans up subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  /**
   * Unsubscribes from all active subscriptions.
   * @private
   */
  private unsubscribeAll(): void {
    this.safeUnsubscribe(this.langSubscription);
    this.safeUnsubscribe(this.interactionSubscription);
  }

  /**
   * Safely unsubscribes from a subscription if it exists.
   * 
   * @param subscription - The subscription to unsubscribe from
   * @private
   */
  private safeUnsubscribe(subscription: Subscription | undefined): void {
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  /**
   * Handles mouse enter events on the component.
   * Triggers video playback if a video URL is available.
   */
  onMouseEnter(): void {
    if (!this.project.videoUrl) return;
    
    this.isHovering = true;
    // Wait for next change detection cycle before attempting playback
    setTimeout(() => this.handleVideoPlayback(), 0);
  }

  /**
   * Manages video playback when the component is hovered.
   * @private
   */
  private handleVideoPlayback(): void {
    const videoEl = this.getVideoElement();
    if (!videoEl) return;
    
    this.resetVideoPosition(videoEl);
    this.attemptVideoPlayback(videoEl);
  }

  /**
   * Retrieves the video element from the view.
   * 
   * @returns The video element or null if not found
   * @private
   */
  private getVideoElement(): HTMLVideoElement | null {
    return this.videoPlayer?.nativeElement || null;
  }

  /**
   * Resets the video playback position to the beginning.
   * 
   * @param videoEl - The video element to reset
   * @private
   */
  private resetVideoPosition(videoEl: HTMLVideoElement): void {
    videoEl.currentTime = 0;
  }

  /**
   * Attempts to play the video with appropriate fallback strategies.
   * 
   * @param videoEl - The video element to play
   * @private
   */
  private attemptVideoPlayback(videoEl: HTMLVideoElement): void {
    if (this.canPlayWithCurrentSettings(videoEl)) {
      this.playVideo(videoEl);
    } else {
      this.playMutedVideo(videoEl);
    }
  }

  /**
   * Determines if the video can play with current settings.
   * 
   * @param videoEl - The video element to check
   * @returns True if the video can play with current settings
   * @private
   */
  private canPlayWithCurrentSettings(videoEl: HTMLVideoElement): boolean {
    return this.userHasInteracted || videoEl.muted;
  }

  /**
   * Attempts to play the video with current settings.
   * Falls back to muted playback if autoplay is blocked.
   * 
   * @param videoEl - The video element to play
   * @private
   */
  private playVideo(videoEl: HTMLVideoElement): void {
    // Only attempt to play if still hovering
    if (!this.isHovering) return;
    
    videoEl.play().catch(err => {
      console.warn('Autoplay not allowed:', err);
      this.playMutedFallback(videoEl);
    });
  }

  /**
   * Plays the video with muted audio.
   * 
   * @param videoEl - The video element to play muted
   * @private
   */
  private playMutedVideo(videoEl: HTMLVideoElement): void {
    videoEl.muted = true;
    this.playVideo(videoEl);
  }

  /**
   * Fallback method to play muted video if unmuted playback fails.
   * 
   * @param videoEl - The video element to apply fallback to
   * @private
   */
  private playMutedFallback(videoEl: HTMLVideoElement): void {
    // Check if still hovering and element exists before attempting to play
    if (!this.isHovering || !videoEl) return;
    
    if (!videoEl.muted) {
      videoEl.muted = true;
      videoEl.play().catch(err => {
        console.error('Autoplay not allowed even with muted video:', err);
      });
    }
  }

  /**
   * Handles mouse leave events on the component.
   * Stops video playback and updates hover state.
   */
  onMouseLeave(): void {
    if (this.isHovering) {
      this.pauseVideo();
      this.isHovering = false;
    }
  }

  /**
   * Pauses video playback.
   * @private
   */
  private pauseVideo(): void {
    const videoEl = this.getVideoElement();
    if (videoEl) {
      videoEl.pause();
    }
  }

  /**
   * Navigates to the project URL if available.
   */
  navigateToProject(): void {
    if (this.project.projectUrl) {
      this.openExternalUrl(this.project.projectUrl);
    }
  }

  /**
   * Opens the project's GitHub page in a new tab if available.
   */
  openGithub(): void {
    if (this.project.githubUrl) {
      this.openExternalUrl(this.project.githubUrl);
    }
  }

  /**
   * Opens an external URL in a new browser tab.
   * 
   * @param url - The URL to open
   * @private
   */
  private openExternalUrl(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * Gets the localized description for the current language.
   * 
   * @returns The localized description text
   */
  get localizedDescription(): string {
    return this.getLocalizedField('description');
  }

  /**
   * Retrieves a localized field based on the current language.
   * 
   * @param fieldPrefix - The prefix of the field to localize
   * @returns The localized field value
   * @private
   */
  private getLocalizedField(fieldPrefix: string): string {
    const lang = this.currentLang || 'de';
    const key = fieldPrefix + this.capitalizeFirstLetter(lang);
    return (this.project as any)[key] || '';
  }

  /**
   * Capitalizes the first letter of a string.
   * 
   * @param text - The text to capitalize
   * @returns The text with first letter capitalized
   * @private
   */
  private capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}