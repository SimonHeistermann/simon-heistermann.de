import { CommonModule, AsyncPipe } from '@angular/common';
import { Component, OnDestroy, Injectable, OnInit } from '@angular/core';
import { Skill } from '../../models/skill.interface';
import { Firestore, collection, doc, collectionData, onSnapshot, addDoc, updateDoc, deleteDoc, query, orderBy, limit, where } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Project } from '../../models/project.interface';

/**
 * Service to manage data retrieval from Firebase Firestore for skills and projects.
 * Subscribes to Firestore collections and provides observable streams for component use.
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseService implements OnDestroy {
  /** Internal subject for skills observable */
  private _skills$ = new BehaviorSubject<Skill[]>([]);

  /** Public observable of skill data */
  skills$ = this._skills$.asObservable();

  /** Internal subject for projects observable */
  private _projects$ = new BehaviorSubject<Project[]>([]);

  /** Public observable of project data */
  projects$ = this._projects$.asObservable();

  /** Unsubscribe function for skills listener */
  private unsubSkills: () => void;

  /** Unsubscribe function for projects listener */
  private unsubProjects: () => void;

  /**
   * Initializes Firestore listeners for skills and projects upon service instantiation.
   * 
   * @param firestore - Injected Firestore instance from AngularFire
   */
  constructor(private firestore: Firestore) {
    this.unsubSkills = this.subSkills();
    this.unsubProjects = this.subProjects();
  }

  /**
   * Cleanup lifecycle hook to unsubscribe from Firestore listeners
   * when the service is destroyed.
   */
  ngOnDestroy(): void {
    this.unsubSkills();
    this.unsubProjects();
  }

  /**
   * Subscribes to the Firestore `skills` collection and updates the observable stream.
   * Filters for skills that have `hasLearnedSkill` set to `true`.
   *
   * @returns Function to unsubscribe from the snapshot listener.
   */
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

  /**
   * Ensures the skill named "Growth Mindset" is placed at the end of the skills list.
   *
   * @param skills - List of skills to sort.
   * @returns A new sorted array with "Growth Mindset" last, if present.
   */
  private sortSkillsWithGrowthMindsetAtEnd(skills: Skill[]): Skill[] {
    const growthMindsetIndex = skills.findIndex(skill => 
      skill.name.toLowerCase() === 'growth mindset');
    if (growthMindsetIndex !== -1) {
      const growthMindsetSkill = skills.splice(growthMindsetIndex, 1)[0];
      skills.push(growthMindsetSkill);
    }
    return skills;
  }

  /**
   * Constructs a `Skill` object from raw Firestore data.
   *
   * @param obj - Raw Firestore skill data.
   * @param id - The document ID (currently unused).
   * @returns A `Skill` object.
   */
  private setSkillObject(obj: any, id: string): Skill {
    return {
      category: obj.category,
      hasLearnedSkill: obj.hasLearnedSkill ?? true,
      name: obj.name,
    };
  }

  /**
   * Gets a Firestore reference to the `skills` collection.
   *
   * @returns Firestore collection reference.
   */
  private getSkillsRef() {
    return collection(this.firestore, 'skills');
  }

  /**
   * Subscribes to the Firestore `projects` collection and updates the observable stream.
   * Filters for projects that have `featured` set to `true`.
   *
   * @returns Function to unsubscribe from the snapshot listener.
   */
  private subProjects() {
    const q = query(this.getProjectsRef(), where("featured", "==", true));
    return onSnapshot(q, (snapshot) => {
      const projects: Project[] = snapshot.docs.map(doc =>
        this.setProjectObject(doc.data(), doc.id)
      );
      this._projects$.next(projects);
    });
  }

  /**
   * Constructs a `Project` object from raw Firestore data.
   *
   * @param obj - Raw Firestore project data.
   * @param id - The document ID (currently unused).
   * @returns A `Project` object.
   */
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

  /**
   * Gets a Firestore reference to the `projects` collection.
   *
   * @returns Firestore collection reference.
   */
  private getProjectsRef() {
    return collection(this.firestore, 'projects');
  }
}