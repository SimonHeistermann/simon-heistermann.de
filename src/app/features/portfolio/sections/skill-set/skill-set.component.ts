import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslationService } from '../../../../core/services/translation-service/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SkillComponent } from "./skill/skill.component";


@Component({
  selector: 'app-skill-set',
  imports: [CommonModule, TranslateModule, SkillComponent],
  templateUrl: './skill-set.component.html',
  styleUrl: './skill-set.component.sass'
})
export class SkillSetComponent implements OnInit, OnDestroy {
  currentLang: string = 'de';
  private langSubscription!: Subscription;

  allSkills: string[] = [
    'Angular',
    'API',
    'Cloud',
    'CSS',
    'Django',
    'Docker',
    'Firebase',
    'Flask',
    'Git',
    'Heroku',
    'HTML',
    'JavaScript',
    'Linux',
    'Material Design',
    'Personal Growth',
    'PostgreSQL',
    'Python',
    'Redis',
    'RXJS',
    'Scrum',
    'SQL',
    'TypeScript',
    'Vue.js',
    'WordPress'
  ];

  mySkills: string[] = [
    'Angular',
    'TypeScript',
    'JavaScript',
    'HTML',
    'API',
    'CSS',
    'Firebase',
    'Scrum',
    'Git',
    'Material Design',
    'Personal Growth'
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
