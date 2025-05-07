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
  currentLang: string = 'de';
  skills: Skill[] = [];

  private langSubscription!: Subscription;
  private skillsSubscription!: Subscription;

  constructor(
    private translationService: TranslationService,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });

    this.skillsSubscription = this.firebaseService.skills$.subscribe((skills: Skill[]) => {
      this.skills = skills;
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
    this.skillsSubscription?.unsubscribe();
  }
}

