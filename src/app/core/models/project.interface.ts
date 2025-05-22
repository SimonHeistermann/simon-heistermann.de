/**
 * Represents a portfolio project with metadata and links.
 */
export interface Project {
    /**
     * The title of the project.
     */
    title: string;
  
    /**
     * The project's description in German.
     */
    descriptionDe: string;
  
    /**
     * The project's description in English.
     */
    descriptionEn: string;
  
    /**
     * A URL pointing to a thumbnail image representing the project.
     */
    thumbnailUrl: string;
  
    /**
     * A URL to a video demonstrating or showcasing the project.
     */
    videoUrl: string;
  
    /**
     * The live URL where the project can be accessed or viewed.
     */
    projectUrl: string;
  
    /**
     * The URL to the project's source code repository on GitHub.
     */
    githubUrl: string;
  
    /**
     * A list of technologies used in the project (e.g., frameworks, languages).
     */
    technologies: string[];
  
    /**
     * Indicates whether the project is marked as featured (e.g., highlighted in the portfolio).
     */
    featured: boolean;
}
  
