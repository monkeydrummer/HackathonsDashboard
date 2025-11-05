import { promises as fs } from 'fs';
import path from 'path';
import { HackathonData, HackathonsList, Project, Team } from './types';
import { decodeScores, encodeScores, isObfuscated } from './obfuscate';

const dataDir = path.join(process.cwd(), 'data');
const hackathonsPath = path.join(dataDir, 'hackathons.json');

export async function getHackathonsList(): Promise<HackathonsList> {
  const fileContents = await fs.readFile(hackathonsPath, 'utf8');
  return JSON.parse(fileContents);
}

export async function getData(hackathonId: string): Promise<HackathonData> {
  const hackathonsList = await getHackathonsList();
  const hackathon = hackathonsList.hackathons.find(h => h.id === hackathonId);
  
  if (!hackathon) {
    throw new Error(`Hackathon ${hackathonId} not found`);
  }

  const dataPath = path.join(dataDir, hackathon.dataFile);
  const fileContents = await fs.readFile(dataPath, 'utf8');
  const rawData: any = JSON.parse(fileContents);
  
  // Decode obfuscated scores
  const data: HackathonData = {
    ...rawData,
    projects: rawData.projects.map((project: any) => ({
      ...project,
      scores: isObfuscated(project.scores) 
        ? decodeScores(project.scores)
        : project.scores
    }))
  };
  
  return data;
}

export async function saveData(hackathonId: string, data: HackathonData): Promise<void> {
  const hackathonsList = await getHackathonsList();
  const hackathon = hackathonsList.hackathons.find(h => h.id === hackathonId);
  
  if (!hackathon) {
    throw new Error(`Hackathon ${hackathonId} not found`);
  }

  // Encode scores before saving
  const dataToSave = {
    ...data,
    projects: data.projects.map(project => ({
      ...project,
      scores: encodeScores(project.scores as any)
    }))
  };

  const dataPath = path.join(dataDir, hackathon.dataFile);
  await fs.writeFile(dataPath, JSON.stringify(dataToSave, null, 2), 'utf8');
}

export async function getTeam(hackathonId: string, teamId: string): Promise<Team | undefined> {
  const data = await getData(hackathonId);
  return data.teams.find(team => team.id === teamId);
}

export async function getProject(hackathonId: string, projectId: string): Promise<Project | undefined> {
  const data = await getData(hackathonId);
  return data.projects.find(project => project.id === projectId);
}

export async function getTeamProjects(hackathonId: string, teamId: string): Promise<Project[]> {
  const data = await getData(hackathonId);
  return data.projects.filter(project => project.teamId === teamId);
}
