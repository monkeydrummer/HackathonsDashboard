export interface Team {
  id: string;
  name: string;
  members: string[];
  projects: string[];
  projectCategory?: string;
}

export interface Link {
  label: string;
  url: string;
}

export type ScoreKey = 'workScope' | 'polish' | 'funUseful' | 'creativity' | 'innovation' | 'doesItWork';

export type Scores = {
  [K in ScoreKey]: number;
} & {
  [key: string]: number; // Allow additional dynamic keys
};

export interface Project {
  id: string;
  teamId: string;
  title: string;
  description: string;
  judgesNotes?: string;
  images: string[];
  links: Link[];
  scores: Scores;
  specialAwards: string[];
}

export interface Category {
  id: ScoreKey;
  label: string;
  weight: number;
}

export interface SpecialAward {
  id: string;
  name: string;
  emoji: string;
}

export interface Config {
  categories: Category[];
  specialAwards: SpecialAward[];
}

export interface HackathonData {
  teams: Team[];
  projects: Project[];
  config: Config;
}

export interface HackathonInfo {
  id: string;
  name: string;
  date: string;
  description: string;
  emoji: string;
  resultsPublished: boolean;
  dataFile: string;
  adminPassword?: string; // Optional per-hackathon obfuscated password
}

export interface HackathonsList {
  hackathons: HackathonInfo[];
}

