import { ElementType } from "react";

export interface RatingsDetails {
  totalRatings: number;
  averageStars: number;
  averagePercentage: number;
  technicalSkillPercent: number;
  physicalFitnessPercent: number;
  gameIntelligencePercent: number;
  mentalResiliencePercent: number;
  professionalismPercent: number;
  growthPotentialPercent: number;
  marketReadinessPercent: number;
}

export interface Super7Breakdown {
  adminRating: number;
  externalGroupRating: number;
  aiAnalysisScore: number;
  playerSelfRating?: number;
  transferValue: number;
  favoriteCount: number;
  profileViews: number;
  bmiScore: number;
}

export interface Super7AlignmentScore {
  score: number;
  status: "GOLD_VERIFIED" | "STANDARD" | "FLAGGED" | "CREDIBILITY_ALERT";
  label: string;
  description: string;
  selfRatingPercentage: number;
  objectiveConsensusScore: number;
  gap: number;
}

export interface PlayerData {
  id: string;
  name: string;
  fullName: string;
  profileImageUrl?: string;
  nationality?: string;
  country?: string;
  age?: number;
  level: string;
  levelTitle: string;
  super7Score: number;
  super7Breakdown?: Super7Breakdown;
  alignmentScore?: Super7AlignmentScore;
  viewsCount: number;
  position?: string;
  ratingsDetails?: RatingsDetails;
}

export interface Super7Score {
  total: number;
  level: string;
  title: string;
  breakdown: Super7Breakdown;
  alignmentScore?: Super7AlignmentScore;
}

export interface Super7ScorePercentages {
  ADMIN: number;
  EXTERNAL_GROUPS: number;
  AI_ANALYSIS: number;
  PLAYER_SELF: number;
  TRANSFER_VALUE: number;
  FAVORITE_COUNT: number;
  PROFILE_VIEWS: number;
  BMI_SCORE: number;
}

export interface PlayerSkillsResponse {
  technicalSkill: number;
  physicalFitness: number;
  gameIntelligence: number;
  mentalResilience: number;
  professionalism: number;
  growthPotential: number;
  marketReadiness: number;
  totalRatings: number;
  averageStars: number;
  averagePercentage: number;
}

export interface Skill {
  name: string;
  value: number;
  icon: ElementType;
  color: string;
}

export interface BreakdownItem {
  name: string;
  value: number;
  icon: ElementType;
  color: string;
  bgColor: string;
}
