import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener, Renderer2, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-mouse-follower',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="cursor-follower" #follower></div>',
  styleUrls: ['./mouse-follower.component.sass']
})
export class MouseFollowerComponent implements OnInit, OnDestroy {
  private mouseX = 0;
  private mouseY = 0;
  private followerX = 0;
  private followerY = 0;
  private isOverBlueElement = false;
  private animationFrameId!: number;
  private blueElements: HTMLElement[] = [];

  @ViewChild('follower', { static: true }) followerElement!: ElementRef;

  constructor(
    private renderer: Renderer2, 
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeElements();
      this.ngZone.runOutsideAngular(() => this.updateFollowerPosition());
    }
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  private initializeElements() {
    this.blueElements = this.getBlueElements();
    this.addElementListeners();
  }

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

  private addElementListeners() {
    this.blueElements.forEach(element => {
      this.renderer.listen(element, 'mouseenter', () => this.onElementMouseEnter());
      this.renderer.listen(element, 'mouseleave', () => this.onElementMouseLeave());
    });
  }

  private onElementMouseEnter() {
    this.isOverBlueElement = true;
    this.renderer.addClass(this.followerElement.nativeElement, 'expanded');
  }

  private onElementMouseLeave() {
    this.isOverBlueElement = false;
    this.renderer.removeClass(this.followerElement.nativeElement, 'expanded');
  }

  private updateFollowerPosition() {
    this.followerX += (this.mouseX - this.followerX) * 0.1;
    this.followerY += (this.mouseY - this.followerY) * 0.1;
    this.applyFollowerStyles();
    this.animationFrameId = requestAnimationFrame(() => this.updateFollowerPosition());
  }

  private applyFollowerStyles() {
    const transform = `translate3d(${this.followerX - 100}px, ${this.followerY - 100}px, 0)`;
    this.renderer.setStyle(this.followerElement.nativeElement, 'transform', transform);
    this.renderer.setStyle(
      this.followerElement.nativeElement,
      'background',
      this.getFollowerBackground()
    );
  }

  private getFollowerBackground(): string {
    return this.isOverBlueElement
      ? 'radial-gradient(circle, rgba(82, 130, 255, 0.4) 0%, rgba(179, 206, 255, 0.2) 40%, rgba(255, 255, 255, 0) 70%)'
      : 'radial-gradient(circle, rgba(100, 149, 237, 0.2) 0%, rgba(255, 255, 255, 0) 70%)';
  }
}


