export interface TypedOptions {
    strings?: string[];
    typeSpeed?: number;
    startDelay?: number;
    backSpeed?: number;
    smartBackspace?: boolean;
    shuffle?: boolean;
    backDelay?: number;
    fadeOut?: boolean;
    fadeOutClass?: string;
    fadeOutDelay?: number;
    loop?: boolean;
    loopCount?: number;
    showCursor?: boolean;
    cursorChar?: string;
    autoInsertCss?: boolean;
    attr?: string;
    bindInputFocusEvents?: boolean;
    contentType?: string;
    onBegin?: (self: any) => void;
    onComplete?: (self: any) => void;
    preStringTyped?: (arrayPos: number, self: any) => void;
    onStringTyped?: (arrayPos: number, self: any) => void;
    onLastStringBackspaced?: (self: any) => void;
    onTypingPaused?: (arrayPos: number, self: any) => void;
    onTypingResumed?: (arrayPos: number, self: any) => void;
    onReset?: (self: any) => void;
    onStop?: (arrayPos: number, self: any) => void;
    onStart?: (arrayPos: number, self: any) => void;
    onDestroy?: (self: any) => void;
  }
  
