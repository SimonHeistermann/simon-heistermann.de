import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

/**
 * Service to track if the user has interacted with the application.
 * It listens for specific user interaction events and emits a boolean
 * observable when the first interaction occurs.
 */
@Injectable({
  providedIn: 'root'
})
export class UserInteractionService {
  /** 
   * Subject that holds whether the user has interacted or not. 
   * Initialized as false.
   */
  private hasInteractedSubject = new BehaviorSubject<boolean>(false);

  /**
   * Observable that emits the user interaction state.
   */
  public hasInteracted$ = this.hasInteractedSubject.asObservable();
  
  /**
   * List of DOM events that are considered user interactions.
   */
  private readonly interactionEvents = [
    'click', 
    'touchstart', 
    'keydown', 
    'scroll', 
    'mousedown'
  ];
  
  /**
   * Creates an instance of UserInteractionService.
   * @param platformId - The platform identifier injected to detect browser environment.
   */
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeInteractionTracking();
  }
  
  /**
   * Initializes interaction tracking by registering event listeners,
   * but only if running in a browser environment.
   */
  private initializeInteractionTracking(): void {
    if (!this.isBrowserEnvironment()) {
      return;
    }
    
    this.registerInteractionEventListeners();
  }
  
  /**
   * Checks if the current platform is a browser.
   * @returns `true` if running in a browser environment, otherwise `false`.
   */
  private isBrowserEnvironment(): boolean {
    return isPlatformBrowser(this.platformId);
  }
  
  /**
   * Registers one-time event listeners for user interaction events on the document.
   * Once any event fires, the user is considered to have interacted.
   */
  private registerInteractionEventListeners(): void {
    this.interactionEvents.forEach(event => {
      document.addEventListener(event, this.handleFirstInteraction.bind(this), { once: true });
    });
  }
  
  /**
   * Handles the first user interaction event.
   * Sets the interaction state to true and removes all event listeners.
   */
  private handleFirstInteraction(): void {
    this.hasInteractedSubject.next(true);
    this.removeAllEventListeners();
  }
  
  /**
   * Removes all registered interaction event listeners.
   * Note: uses `.bind(this)` so listeners match those registered.
   */
  private removeAllEventListeners(): void {
    this.interactionEvents.forEach(event => {
      document.removeEventListener(event, this.handleFirstInteraction.bind(this));
    });
  }
  
  /**
   * Returns whether the user has already interacted.
   */
  public get hasInteracted(): boolean {
    return this.hasInteractedSubject.value;
  }
}