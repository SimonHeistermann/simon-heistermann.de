/**
 * Represents a specific skill and its classification.
 */
export interface Skill {
    /**
     * The category or group this skill belongs to (e.g., "Frontend", "Backend", "Tools").
     */
    category: string;
  
    /**
     * Indicates whether this skill has already been learned or acquired.
     */
    hasLearnedSkill: boolean;
  
    /**
     * The name of the skill (e.g., "JavaScript", "React", "Git").
     */
    name: string;
}
  
