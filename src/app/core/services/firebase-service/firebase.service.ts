import { CommonModule, AsyncPipe } from '@angular/common';
import { Component, OnDestroy, Injectable, OnInit } from '@angular/core';
import { Skill } from '../../models/skill.interface';
import { Firestore, collection, doc, collectionData, onSnapshot, addDoc, updateDoc, deleteDoc, query, orderBy, limit, where } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Project } from '../../models/project.interface';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService implements OnDestroy {
  private _skills$ = new BehaviorSubject<Skill[]>([]);
  skills$ = this._skills$.asObservable();
  private _projects$ = new BehaviorSubject<Project[]>([]);
  projects$ = this._projects$.asObservable();


  private unsubSkills: () => void;
  private unsubProjects: () => void;

  constructor(private firestore: Firestore) {
    this.unsubSkills = this.subSkills();
    this.unsubProjects = this.subProjects();
  }

  ngOnDestroy(): void {
    this.unsubSkills();
    this.unsubProjects();
  }

  private subSkills() {
    const q = query(this.getSkillsRef(), where("hasLearnedSkill", "==", true));
    return onSnapshot(q, (snapshot) => {
      let skills: Skill[] = snapshot.docs.map(doc =>
        this.setSkillObject(doc.data(), doc.id)
      );
      skills = this.sortSkillsWithGrowthMindsetAtEnd(skills);
      this._skills$.next(skills);
    });
  }

  private sortSkillsWithGrowthMindsetAtEnd(skills: Skill[]): Skill[] {
    const growthMindsetIndex = skills.findIndex(skill => 
      skill.name.toLowerCase() === 'growth mindset');
    if (growthMindsetIndex !== -1) {
      const growthMindsetSkill = skills.splice(growthMindsetIndex, 1)[0];
      skills.push(growthMindsetSkill);
    }
    return skills;
  }

  private setSkillObject(obj: any, id: string): Skill {
    return {
      category: obj.category,
      hasLearnedSkill: obj.hasLearnedSkill ?? true,
      name: obj.name,
    };
  }

  private getSkillsRef() {
    return collection(this.firestore, 'skills');
  }

  private subProjects() {
    const q = query(this.getProjectsRef(), where("featured", "==", true));
    return onSnapshot(q, (snapshot) => {
      const projects: Project[] = snapshot.docs.map(doc =>
        this.setProjectObject(doc.data(), doc.id)
      );
      this._projects$.next(projects);
    });
  }

  private setProjectObject(obj: any, id: string): Project {
    return {
      title: obj.title,
      descriptionDe: obj.descriptionDe,
      descriptionEn: obj.descriptionEn,
      featured: obj.featured ?? true,
      thumbnailUrl: obj.thumbnailUrl,
      videoUrl: obj.videoUrl,
      projectUrl: obj.projectUrl,
      githubUrl: obj.githubUrl,
      technologies: obj.technologies
    };
  }
  
  private getProjectsRef() {
    return collection(this.firestore, 'projects');
  }
  
}

