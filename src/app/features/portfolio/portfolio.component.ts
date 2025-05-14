import { Component } from '@angular/core';
import { IntroComponent } from "./sections/intro/intro.component";
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AboutComponent } from './sections/about/about.component';
import { MouseFollowerComponent } from '../../shared/components/mouse-follower/mouse-follower.component';
import { SkillSetComponent } from './sections/skill-set/skill-set.component';
import { ProjectsComponent } from './sections/projects/projects.component';
import { ReferencesComponent } from "./sections/references/references.component";
import { ContactComponent } from "./sections/contact/contact.component";
type FormOverlayStatus = { submitting: boolean; submitSuccess: boolean; submitError: boolean };

@Component({
  selector: 'app-portfolio',
  imports: [
    IntroComponent, CommonModule, HeaderComponent,
    AboutComponent, MouseFollowerComponent, SkillSetComponent,
    ProjectsComponent, ReferencesComponent, ContactComponent
],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.sass'
})
export class PortfolioComponent {

  formOverlayStatus: FormOverlayStatus = { submitting: false, submitSuccess: false, submitError: false };

  constructor() {}

  onFormOverlayStatusChanged(status: FormOverlayStatus): void {
    this.formOverlayStatus = status;
  }
  

}
