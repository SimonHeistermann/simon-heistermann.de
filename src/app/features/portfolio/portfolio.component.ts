import { Component } from '@angular/core';
import { IntroComponent } from "./sections/intro/intro.component";
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AboutComponent } from './sections/about/about.component';
import { MouseFollowerComponent } from '../../shared/components/mouse-follower/mouse-follower.component';
import { SkillSetComponent } from './sections/skill-set/skill-set.component';
import { ProjectsComponent } from './sections/projects/projects.component';

@Component({
  selector: 'app-portfolio',
  imports: [
    IntroComponent, CommonModule, HeaderComponent, 
    AboutComponent, MouseFollowerComponent, SkillSetComponent,
    ProjectsComponent
  ],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.sass'
})
export class PortfolioComponent {

}
