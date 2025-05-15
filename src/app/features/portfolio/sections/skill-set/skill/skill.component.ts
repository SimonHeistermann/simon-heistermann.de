import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { TranslationService } from '../../../../../core/services/translation-service/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ProjectService } from '../../../../../core/services/project-service/project.service';

@Component({
  selector: 'app-skill',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './skill.component.html',
  styleUrl: './skill.component.sass'
})
export class SkillComponent implements OnInit, OnDestroy {
  @Input() skillName: string = '';
  isHovered: boolean = false;
  currentLang: string = 'de';
  private langSubscription!: Subscription;

  constructor(
    private translationService: TranslationService,
    private projectService: ProjectService
  ) {}

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

  getIconPath(): string {
    let formattedName = this.skillName.toLowerCase()
      .replace(/\./g, '_')  
      .replace(/\s+/g, '_');
  
    const basePath = this.projectService.isMobile() ? '/icons/skills/mobile' : '/icons/skills';
  
    return `${basePath}/${formattedName}_icon.png`;
  }
  

  onMouseEnter(): void {
    if (this.skillName === 'Personal Growth') {
      this.isHovered = true;
    }
  }

  onMouseLeave(): void {
    this.isHovered = false;
  }
}
