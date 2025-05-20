import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslationService } from '../../../../core/services/translation-service/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SkillComponent } from "./skill/skill.component";
import { Skill } from '../../../../core/models/skill.interface';
import { FirebaseService } from '../../../../core/services/firebase-service/firebase.service';

@Component({
  selector: 'app-skill-set',
  standalone: true,
  imports: [CommonModule, TranslateModule, SkillComponent],
  templateUrl: './skill-set.component.html',
  styleUrl: './skill-set.component.sass'
})
export class SkillSetComponent implements OnInit, OnDestroy {
  /**
   * Current language code, defaulting to 'de'.
   */
  currentLang: string = 'de';

  /**
   * Array holding the list of skills.
   */
  skills: Skill[] = [];

  /**
   * Subscription for language changes.
   */
  private langSubscription!: Subscription;

  /**
   * Subscription for skills data changes.
   */
  private skillsSubscription!: Subscription;

  /**
   * Constructor to inject necessary services.
   * @param translationService Service to handle translations.
   * @param firebaseService Service to fetch skills data from Firebase.
   */
  constructor(
    private translationService: TranslationService,
    private firebaseService: FirebaseService
  ) {}

  /**
   * Angular lifecycle hook called on component initialization.
   * Subscribes to language changes and skills data streams.
   */
  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });

    this.skillsSubscription = this.firebaseService.skills$.subscribe((skills: Skill[]) => {
      this.skills = skills;
    });
  }

  /**
   * Angular lifecycle hook called just before component destruction.
   * Unsubscribes from all subscriptions to avoid memory leaks.
   */
  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
    this.skillsSubscription?.unsubscribe();
  }
}