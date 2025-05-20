import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener, Renderer2, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Component that creates a decorative mouse follower effect
 * The follower is a circular gradient that follows the mouse pointer with smooth animation
 * and reacts to specific elements on the page by changing appearance
 */
@Component({
  selector: 'app-mouse-follower',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="cursor-follower" #follower></div>',
  styleUrls: ['./mouse-follower.component.sass']
})
export class MouseFollowerComponent implements OnInit, OnDestroy {
  /** Current mouse X position */
  private mouseX = 0;
  
  /** Current mouse Y position */
  private mouseY = 0;
  
  /** Current follower X position (smoothed) */
  private followerX = 0;
  
  /** Current follower Y position (smoothed) */
  private followerY = 0;
  
  /** Tracks whether mouse is currently over a blue/highlighted element */
  private isOverBlueElement = false;
  
  /** ID of the current animation frame for position updates */
  private animationFrameId!: number;
  
  /** Collection of elements that trigger the expanded follower state */
  private blueElements: HTMLElement[] = [];
  
  /** Flag indicating if the current device is mobile/touch-based */
  private isMobileDevice = false;
  
  /** Current window width in pixels */
  private windowWidth = 0;
  
  /** Base size of the follower in pixels (will be scaled for responsive design) */
  private baseFollowerSize = 200;

  /**
   * Reference to the follower DOM element
   */
  @ViewChild('follower', { static: true }) followerElement!: ElementRef;

  /**
   * Creates an instance of MouseFollowerComponent
   * @param renderer - Angular's renderer for DOM manipulations
   * @param ngZone - Angular's NgZone service for running code outside Angular's change detection
   * @param platformId - Injection token to determine platform environment
   */
  constructor(
    private renderer: Renderer2, 
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Lifecycle hook that initializes the component
   * Sets up the follower if running in browser and not on mobile
   */
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkDeviceType();
      this.setFollowerSize();
      
      if (!this.isMobileDevice) {
        this.initializeElements();
        this.showFollower();
      } else {
        this.hideFollower();
      }
    }
  }

  /**
   * Lifecycle hook for component destruction
   * Cleans up animation frame if active
   */
  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Host listener for window resize
   * Updates follower size and visibility based on new window dimensions
   */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkDeviceType();
    this.setFollowerSize();
    this.updateFollowerVisibility();
  }
  
  /**
   * Updates the follower visibility based on device type
   * Shows on desktop, hides on mobile
   */
  private updateFollowerVisibility() {
    if (this.isMobileDevice) {
      this.hideFollower();
    } else {
      this.showFollower();
    }
  }
  
  /**
   * Hides the follower element and cancels animation
   */
  private hideFollower() {
    this.renderer.setStyle(this.followerElement.nativeElement, 'display', 'none');
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }
  
  /**
   * Shows the follower element and starts position animation
   */
  private showFollower() {
    this.renderer.setStyle(this.followerElement.nativeElement, 'display', 'block');
    if (!this.animationFrameId) {
      this.ngZone.runOutsideAngular(() => this.updateFollowerPosition());
    }
  }

  /**
   * Host listener for mouse movement
   * Updates stored mouse position
   * @param event - Mouse movement event
   */
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isMobileDevice) {
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    }
  }

  /**
   * Determines if the current device is mobile based on width and touch capabilities
   * Updates internal state accordingly
   */
  private checkDeviceType() {
    this.windowWidth = window.innerWidth;
    this.isMobileDevice = 
      window.innerWidth <= 768 || 
      ('ontouchstart' in window) || 
      (navigator.maxTouchPoints > 0);
  }

  /**
   * Sets the follower size based on window width for responsive design
   * Updates CSS variables for follower dimensions
   */
  private setFollowerSize() {
    const scaleFactor = Math.min(1, this.windowWidth / 1200);
    const newSize = Math.round(this.baseFollowerSize * scaleFactor);
    const expandedSize = Math.round(300 * scaleFactor); 
    document.documentElement.style.setProperty('--follower-size', `${newSize}px`);
    document.documentElement.style.setProperty('--follower-expanded-size', `${expandedSize}px`);
  }

  /**
   * Initializes elements that trigger follower expansion
   * Sets up event listeners
   */
  private initializeElements() {
    this.blueElements = this.getBlueElements();
    this.addElementListeners();
  }

  /**
   * Finds all elements that should trigger follower expansion
   * @returns Array of HTML elements
   */
  private getBlueElements(): HTMLElement[] {
    return [
      document.querySelector('.ellipse__3'),
      document.querySelector('.main__text h1'),
      document.querySelector('.main__text h2'),
      document.querySelector('.ellipse__5'),
      document.querySelector('.ellipse__6'),
      document.querySelector('.content__left h2'),
      document.querySelector('.content__left h3')
    ].filter(el => el !== null) as HTMLElement[];
  }

  /**
   * Adds mouse enter/leave event listeners to tracked elements
   */
  private addElementListeners() {
    this.blueElements.forEach(element => {
      this.renderer.listen(element, 'mouseenter', () => this.onElementMouseEnter());
      this.renderer.listen(element, 'mouseleave', () => this.onElementMouseLeave());
    });
  }

  /**
   * Handler for mouse entering a tracked element
   * Expands the follower and changes its appearance
   */
  private onElementMouseEnter() {
    this.isOverBlueElement = true;
    this.renderer.addClass(this.followerElement.nativeElement, 'expanded');
  }

  /**
   * Handler for mouse leaving a tracked element
   * Returns follower to default state
   */
  private onElementMouseLeave() {
    this.isOverBlueElement = false;
    this.renderer.removeClass(this.followerElement.nativeElement, 'expanded');
  }

  /**
   * Updates follower position with smooth animation
   * Uses requestAnimationFrame for smooth performance
   */
  private updateFollowerPosition() {
    this.followerX += (this.mouseX - this.followerX) * 0.1;
    this.followerY += (this.mouseY - this.followerY) * 0.1;
    this.applyFollowerStyles();
    this.animationFrameId = requestAnimationFrame(() => this.updateFollowerPosition());
  }

  /**
   * Applies calculated styles to the follower element
   * Updates position and background gradient
   */
  private applyFollowerStyles() {
    const followerSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--follower-size'));
    const transform = `translate3d(${this.followerX - followerSize/2}px, ${this.followerY - followerSize/2}px, 0)`;
    
    this.renderer.setStyle(this.followerElement.nativeElement, 'transform', transform);
    this.renderer.setStyle(
      this.followerElement.nativeElement,
      'background',
      this.getFollowerBackground()
    );
  }

  /**
   * Determines the appropriate background gradient based on current state
   * @returns CSS gradient string
   */
  private getFollowerBackground(): string {
    return this.isOverBlueElement
      ? 'radial-gradient(circle, rgba(82, 130, 255, 0.4) 0%, rgba(179, 206, 255, 0.2) 40%, rgba(255, 255, 255, 0) 70%)'
      : 'radial-gradient(circle, rgba(100, 149, 237, 0.2) 0%, rgba(255, 255, 255, 0) 70%)';
  }
}


