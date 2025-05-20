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
  /**
   * The name of the skill to display.
   */
  @Input() skillName: string = '';

  /**
   * Indicates whether the skill element is currently hovered.
   */
  isHovered: boolean = false;

  /**
   * Current language code, defaults to 'de'.
   */
  currentLang: string = 'de';

  /**
   * Subscription to language changes.
   */
  private langSubscription!: Subscription;

  /**
   * Creates an instance of SkillComponent.
   * @param translationService Service for handling translations.
   * @param projectService Service for project-related utilities.
   */
  constructor(
    private translationService: TranslationService,
    private projectService: ProjectService
  ) {}

  /**
   * Angular lifecycle hook that is called after component initialization.
   * Subscribes to the current language observable to update `currentLang`.
   */
  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  /**
   * Angular lifecycle hook called before the component is destroyed.
   * Unsubscribes from language subscription to avoid memory leaks.
   */
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  /**
   * Returns the path to the icon image based on the skill name and device type.
   * The skill name is formatted by replacing dots and spaces with underscores.
   * @returns The full path to the skill icon image.
   */
  getIconPath(): string {
    let formattedName = this.skillName.toLowerCase()
      .replace(/\./g, '_')  
      .replace(/\s+/g, '_');
      
    const basePath = this.projectService.isMobile() ? '/icons/skills/mobile' : '/icons/skills';

    return `${basePath}/${formattedName}_icon.png`;
  }

  /**
   * Event handler for mouse enter event.
   * Sets `isHovered` to true only if the skill name is "Personal Growth".
   */
  onMouseEnter(): void {
    if (this.skillName === 'Personal Growth') {
      this.isHovered = true;
    }
  }

  /**
   * Event handler for mouse leave event.
   * Resets `isHovered` to false.
   */
  onMouseLeave(): void {
    this.isHovered = false;
  }
}