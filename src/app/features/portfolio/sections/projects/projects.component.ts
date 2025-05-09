import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectComponent } from './project/project.component';
import { Project } from '../../../../core/models/project.interface';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../../../../core/services/firebase-service/firebase.service';
import { log } from 'console';

@Component({
  selector: 'app-projects',
  imports: [CommonModule, ProjectComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.sass'
})
export class ProjectsComponent implements OnInit, OnDestroy {
  projects: Project[] = [];

  private projectsSubscription!: Subscription;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.projectsSubscription = this.firebaseService.projects$.subscribe((projects: Project[]) => {
      this.projects = projects;
    });
  }

  ngOnDestroy(): void {
    this.projectsSubscription?.unsubscribe();
  }

}
