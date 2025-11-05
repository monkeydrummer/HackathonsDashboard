export interface Team {
  id: string;
  name: string;
  members: string[];
  projects: string[];
}

export interface Link {
  label: string;
  url: string;
}

export interface Scores {
  workScope: number;
  polish: number;
  funUseful: number;
  creativity: number;
  innovation: number;
  doesItWork: number;
}

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
  id: keyof Scores;
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
}

export interface HackathonsList {
  hackathons: HackathonInfo[];
}

