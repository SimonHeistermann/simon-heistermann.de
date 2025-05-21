import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Firestore, collection, query, where } from '@angular/fire/firestore';
import { Skill } from '../../models/skill.interface';
import { Project } from '../../models/project.interface';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { collectionData } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  /**
   * Observable stream of skills that have been learned.
   */
  skills$: Observable<Skill[]> = of([]);

  /**
   * Observable stream of featured projects.
   */
  projects$: Observable<Project[]> = of([]);

  /**
   * Creates an instance of FirebaseService.
   * Initializes skills$ and projects$ observables only on the browser platform.
   * 
   * @param firestore - Firestore instance for querying the database
   * @param platformId - Platform identifier used to check if running in browser
   */
  constructor(
    private firestore: Firestore,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.skills$ = this.loadSkills();
      this.projects$ = this.loadProjects();
    }
  }

  /**
   * Loads skills from Firestore where `hasLearnedSkill` is true.
   * Sorts skills to put "growth mindset" at the end of the list.
   * 
   * @returns Observable emitting an array of Skill objects
   */
  private loadSkills(): Observable<Skill[]> {
    const skillsRef = collection(this.firestore, 'skills');
    const q = query(skillsRef, where("hasLearnedSkill", "==", true));
    return collectionData(q, {idField: 'id'}).pipe(
      map((docs: any[]) => {
        let skills = docs.map(doc => this.setSkillObject(doc));
        return this.sortSkillsWithGrowthMindsetAtEnd(skills);
      })
    );
  }

  /**
   * Sorts the given skills array so that the skill with name "growth mindset" (case insensitive)
   * is moved to the end of the array.
   * 
   * @param skills - Array of Skill objects to sort
   * @returns The sorted array of Skill objects
   */
  private sortSkillsWithGrowthMindsetAtEnd(skills: Skill[]): Skill[] {
    const idx = skills.findIndex(s => s.name.toLowerCase() === 'growth mindset');
    if (idx !== -1) {
      const gm = skills.splice(idx, 1)[0];
      skills.push(gm);
    }
    return skills;
  }

  /**
   * Maps a raw Firestore document to a Skill object.
   * Defaults `hasLearnedSkill` to true if not set.
   * 
   * @param obj - Raw Firestore document object
   * @returns Skill object
   */
  private setSkillObject(obj: any): Skill {
    return {
      category: obj.category,
      hasLearnedSkill: obj.hasLearnedSkill ?? true,
      name: obj.name,
    };
  }

  /**
   * Loads projects from Firestore where `featured` is true.
   * 
   * @returns Observable emitting an array of Project objects
   */
  private loadProjects(): Observable<Project[]> {
    const projectsRef = collection(this.firestore, 'projects');
    const q = query(projectsRef, where("featured", "==", true));
    return collectionData(q, {idField: 'id'}).pipe(
      map((docs: any[]) => docs.map(doc => this.setProjectObject(doc)))
    );
  }

  /**
   * Maps a raw Firestore document to a Project object.
   * Defaults `featured` to true if not set.
   * 
   * @param obj - Raw Firestore document object
   * @returns Project object
   */
  private setProjectObject(obj: any): Project {
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
}