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
export class PortfolioComponent implements OnInit {
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
    private projectService: ProjectService
  ) {
    this.platformId = platformId;
  }

  /**
   * Angular lifecycle hook that runs after the component is initialized.
   * 
   * If in the browser, disables automatic scroll restoration and performs
   * smooth scrolling to the anchor section based on the current URL hash.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        setTimeout(() => {
          this.smoothScrollToSection(hash);
        }, 250);
      }
    }
  }

  /**
   * Smoothly scrolls to a section identified by its DOM element ID.
   * 
   * Accounts for fixed header offset on desktop devices.
   * 
   * @param sectionId The ID of the target section element.
   */
  private smoothScrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (!element) return;
    const isMobile = this.projectService.isMobileWide();
    const yOffset = isMobile ? 0 : 117;
    const y = element.getBoundingClientRect().top + window.scrollY - yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
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

