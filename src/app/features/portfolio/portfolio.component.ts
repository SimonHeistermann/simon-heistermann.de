import { Component, PLATFORM_ID, OnInit, Inject } from '@angular/core';
import { IntroComponent } from "./sections/intro/intro.component";
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AboutComponent } from './sections/about/about.component';
import { MouseFollowerComponent } from '../../shared/components/mouse-follower/mouse-follower.component';
import { SkillSetComponent } from './sections/skill-set/skill-set.component';
import { ProjectsComponent } from './sections/projects/projects.component';
import { ReferencesComponent } from "./sections/references/references.component";
import { ContactComponent } from "./sections/contact/contact.component";
import { ProjectService } from '../../core/services/project-service/project.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Type defining the status of a form overlay.
 */
type FormOverlayStatus = { 
  /** Indicates if the form submission is in progress. */
  submitting: boolean; 
  /** Indicates if the form submission was successful. */
  submitSuccess: boolean; 
  /** Indicates if the form submission encountered an error. */
  submitError: boolean; 
};

/**
 * Component representing the main portfolio page.
 * 
 * Integrates multiple section components such as intro, about, skills, projects, references, and contact.
 * Handles form overlay status and smooth scrolling to sections on initialization based on URL hash.
 */
@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    IntroComponent,
    CommonModule,
    HeaderComponent,
    AboutComponent,
    MouseFollowerComponent,
    SkillSetComponent,
    ProjectsComponent,
    ReferencesComponent,
    ContactComponent
  ],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.sass']
})
export class PortfolioComponent {
  /**
   * Tracks the current status of the contact form overlay.
   */
  formOverlayStatus: FormOverlayStatus = {
    submitting: false,
    submitSuccess: false,
    submitError: false
  };

  /**
   * Platform ID used to determine whether the app is running in the browser or on the server.
   */
  private platformId: Object;

  /**
   * Creates an instance of the PortfolioComponent.
   * 
   * @param platformId Platform identifier injected via Angular's dependency injection.
   * @param projectService Service used to determine viewport context (e.g. mobile or desktop).
   */
  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private projectService: ProjectService,
    private router: Router
  ) {
    this.platformId = platformId;
  }

  /**
   * Updates the local form overlay status based on the emitted value from the child component.
   * 
   * @param status The new status of the form overlay.
   */
  onFormOverlayStatusChanged(status: FormOverlayStatus): void {
    this.formOverlayStatus = status;
  }
}

