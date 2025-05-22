/**
 * Configuration options for a typing animation library.
 */
export interface TypedOptions {
  /**
   * An array of strings to be typed.
   */
  strings?: string[];

  /**
   * The typing speed in milliseconds per character.
   */
  typeSpeed?: number;

  /**
   * Delay before typing starts in milliseconds.
   */
  startDelay?: number;

  /**
   * The backspace speed in milliseconds per character.
   */
  backSpeed?: number;

  /**
   * Enables smart backspacing to only backspace what doesn't match the previous string.
   */
  smartBackspace?: boolean;

  /**
   * Randomizes the order of strings.
   */
  shuffle?: boolean;

  /**
   * Delay before backspacing in milliseconds.
   */
  backDelay?: number;

  /**
   * Enables fade out effect instead of backspacing.
   */
  fadeOut?: boolean;

  /**
   * CSS class for the fade out effect.
   */
  fadeOutClass?: string;

  /**
   * Delay before the fade out effect in milliseconds.
   */
  fadeOutDelay?: number;

  /**
   * Enables continuous looping of the typing animation.
   */
  loop?: boolean;

  /**
   * Number of loops before stopping. Use `Infinity` for endless loops.
   */
  loopCount?: number;

  /**
   * Shows the cursor during typing.
   */
  showCursor?: boolean;

  /**
   * The character used as the cursor.
   */
  cursorChar?: string;

  /**
   * Automatically inserts required CSS for cursor and fade effects.
   */
  autoInsertCss?: boolean;

  /**
   * Attribute to bind the typing effect to (e.g., 'placeholder' or 'value').
   */
  attr?: string;

  /**
   * Binds input focus and blur events to control typing animation.
   */
  bindInputFocusEvents?: boolean;

  /**
   * Content type, e.g., 'html' or 'null' for plain text.
   */
  contentType?: string;

  /**
   * Callback fired when typing animation begins.
   * @param self - The instance of the typing animation.
   */
  onBegin?: (self: any) => void;

  /**
   * Callback fired when typing animation completes.
   * @param self - The instance of the typing animation.
   */
  onComplete?: (self: any) => void;

  /**
   * Callback fired before typing each string.
   * @param arrayPos - The current string index.
   * @param self - The instance of the typing animation.
   */
  preStringTyped?: (arrayPos: number, self: any) => void;

  /**
   * Callback fired after typing each string.
   * @param arrayPos - The current string index.
   * @param self - The instance of the typing animation.
   */
  onStringTyped?: (arrayPos: number, self: any) => void;

  /**
   * Callback fired after the last string is fully backspaced.
   * @param self - The instance of the typing animation.
   */
  onLastStringBackspaced?: (self: any) => void;

  /**
   * Callback fired when typing is paused.
   * @param arrayPos - The current string index.
   * @param self - The instance of the typing animation.
   */
  onTypingPaused?: (arrayPos: number, self: any) => void;

  /**
   * Callback fired when typing is resumed.
   * @param arrayPos - The current string index.
   * @param self - The instance of the typing animation.
   */
  onTypingResumed?: (arrayPos: number, self: any) => void;

  /**
   * Callback fired when the typing animation is reset.
   * @param self - The instance of the typing animation.
   */
  onReset?: (self: any) => void;

  /**
   * Callback fired when the typing animation is stopped.
   * @param arrayPos - The current string index.
   * @param self - The instance of the typing animation.
   */
  onStop?: (arrayPos: number, self: any) => void;

  /**
   * Callback fired when the typing animation is started.
   * @param arrayPos - The current string index.
   * @param self - The instance of the typing animation.
   */
  onStart?: (arrayPos: number, self: any) => void;

  /**
   * Callback fired when the typing animation is destroyed.
   * @param self - The instance of the typing animation.
   */
  onDestroy?: (self: any) => void;
}

  
