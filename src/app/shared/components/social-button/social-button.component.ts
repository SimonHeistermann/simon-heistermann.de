import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Union type representing supported social media platforms
 */
type SocialType = 'github' | 'linkedin' | 'email';

/**
 * Interface for storing default and hover image paths
 */
interface SocialImagePaths {
  default: string;
  hover: string;
}

/**
 * Component for displaying social media buttons with hover effects
 * This component handles the display of social icons that change appearance on hover
 */
@Component({
  selector: 'app-social-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-button.component.html',
  styleUrls: ['./social-button.component.sass'],
})
export class SocialButtonComponent implements OnInit {
  /**
   * The type of social media button to display
   */
  @Input() type!: SocialType;

  /**
   * The URL to navigate to when clicked
   */
  @Input() link = '';

  /**
   * Path to the default (non-hovered) image
   */
  defaultImage = '';

  /**
   * Path to the hover image
   */
  hoverImage = '';

  /**
   * Tracks whether the button is currently being hovered
   */
  isHovered = false;

  /**
   * Initialize the component by setting up image paths
   */
  ngOnInit() {
    this.setupImagePaths();
  }

  /**
   * Sets up the default and hover image paths based on the social type
   */
  setupImagePaths(): void {
    const imagePaths = this.getSocialImagePaths(this.type);
    this.defaultImage = imagePaths.default;
    this.hoverImage = imagePaths.hover;
  }

  /**
   * Retrieves image paths for the specified social type
   * @param type - The social media type to get images for
   * @returns Object containing default and hover image paths
   */
  getSocialImagePaths(type: SocialType): SocialImagePaths {
    const imageMap = this.createSocialImageMap();
    return imageMap[type];
  }

  /**
   * Creates a mapping of social types to their respective image paths
   * @returns Record mapping each social type to its image paths
   */
  createSocialImageMap(): Record<SocialType, SocialImagePaths> {
    const base = '/icons';
    return {
      github: this.createImagePathPair(base, 'github_socials_icon'),
      linkedin: this.createImagePathPair(base, 'linkedin_socials_icon'),
      email: this.createImagePathPair(base, 'email_socials_icon'),
    };
  }

  /**
   * Creates a pair of default and hover image paths
   * @param base - The base directory for icons
   * @param name - The base name of the icon
   * @returns Object containing default and hover image paths
   */
  createImagePathPair(base: string, name: string): SocialImagePaths {
    return {
      default: `${base}/${name}_default.png`,
      hover: `${base}/${name}_hover.png`,
    };
  }

  /**
   * Gets the current animation state based on hover status
   * @returns Object containing the animation state value
   */
  get animationState() {
    return {
      value: this.isHovered ? 'hover' : 'default',
    };
  }

  /**
   * Handler for mouse enter events
   */
  onMouseEnter(): void {
    this.isHovered = true;
  }

  /**
   * Handler for mouse leave events
   */
  onMouseLeave(): void {
    this.isHovered = false;
  }
}