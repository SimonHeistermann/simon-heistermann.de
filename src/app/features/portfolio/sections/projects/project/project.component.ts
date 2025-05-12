import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from '../../../../../core/models/project.interface';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../../../../../core/services/firebase-service/firebase.service';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../../../../core/services/translation-service/translation.service';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.sass'
})
export class ProjectComponent implements OnInit, OnDestroy {
  @Input() project!: Project;
  @Input() layout: 'left' | 'right' = 'left';
  isHovering = false;
  currentLang: string = 'de';
  private langSubscription!: Subscription;
  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;
  private videoPreloaded = false;


  constructor(
    private router: Router, 
    private firebaseService: FirebaseService, 
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
    if (!this.project) {
      console.error('Project input is required!');
    }
    if (this.project.videoUrl) {
      this.preloadVideo();
    }
  }

  preloadVideo(): void {
    if (this.videoPreloaded || !this.project.videoUrl) return;
    const video = new HTMLVideoElement();
    video.preload = 'auto';
    video.muted = true;
    video.src = this.project.videoUrl;
    video.load();
    video.onloadeddata = () => {
      this.videoPreloaded = true;
    };
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  onMouseEnter(): void {
    if (this.project.videoUrl) {
      this.isHovering = true;
      setTimeout(() => {
        if (this.videoPlayer && this.videoPlayer.nativeElement) {
          this.videoPlayer.nativeElement.currentTime = 0;
          this.videoPlayer.nativeElement.play().catch(err => {
            console.warn('Autoplay not allowed:', err);
          });
        }
      }, 0);
    }
  }

  onMouseLeave(): void {
    this.isHovering = false;
  }

  navigateToProject(): void {
    if (this.project.projectUrl) {
      window.open(this.project.projectUrl, '_blank');
    } else {
      // Alternative: navigate to a detail page using the project ID
      // this.router.navigate(['/projects', this.project.id]);
    }
  }

  openGithub(): void {
    if (this.project.githubUrl) {
      window.open(this.project.githubUrl, '_blank');
    }
  }

  get localizedDescription(): string {
    const lang = this.currentLang || 'de';
    const key = 'description' + lang.charAt(0).toUpperCase() + lang.slice(1);
    return (this.project as any)[key] || '';
  }
  
}
