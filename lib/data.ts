import { HackathonData, HackathonsList, Project, Team } from './types';
import { 
  getHackathonsList as getHackathonsListFromStorage,
  getHackathonData,
  saveHackathonData,
  saveHackathonsList as saveHackathonsListToStorage
} from './storage';

// Re-export storage functions with original names for compatibility
export async function getHackathonsList(): Promise<HackathonsList> {
  return getHackathonsListFromStorage();
}

export async function saveHackathonsList(list: HackathonsList): Promise<void> {
  return saveHackathonsListToStorage(list);
}

export async function getData(hackathonId: string): Promise<HackathonData> {
  return getHackathonData(hackathonId);
}

export async function saveData(hackathonId: string, data: HackathonData): Promise<void> {
  return saveHackathonData(hackathonId, data);
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
