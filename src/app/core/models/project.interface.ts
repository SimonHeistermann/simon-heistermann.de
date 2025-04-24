export interface Project {
    id: string;
    title: string;
    descriptionDe: string;
    descriptionEn: string;
    thumbnailUrl: string;
    projectUrl: string;
    githubUrl?: string;
    technologies: string[];
    featured: boolean;
    date: Date;
}
