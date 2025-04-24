import { Component, Input, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { CommonModule } from '@angular/common';

type SocialType = 'github' | 'linkedin' | 'email';

@Component({
  selector: 'app-social-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-button.component.html',
  styleUrls: ['./social-button.component.sass'],
})
export class SocialButtonComponent implements OnInit {
  @Input() type!: SocialType;
  @Input() link = '';

  defaultImage = '';
  hoverImage = '';
  isHovered = false;

  ngOnInit() {
    const base = '/icons';

    const imageMap: Record<SocialType, { default: string, hover: string }> = {
      github: {
        default: `${base}/github_socials_icon_default.png`,
        hover: `${base}/github_socials_icon_hover.png`,
      },
      linkedin: {
        default: `${base}/linkedin_socials_icon_default.png`,
        hover: `${base}/linkedin_socials_icon_hover.png`,
      },
      email: {
        default: `${base}/email_socials_icon_default.png`,
        hover: `${base}/email_socials_icon_hover.png`,
      },
    };
    const selected = imageMap[this.type];
    this.defaultImage = selected.default;
    this.hoverImage = selected.hover;
  }

  get animationState() {
    return {
      value: this.isHovered ? 'hover' : 'default',
    };
  }

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }
}


