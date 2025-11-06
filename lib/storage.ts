import { promises as fs } from 'fs';
import path from 'path';
import { HackathonData, HackathonsList } from './types';
import { decodeScores, encodeScores, isObfuscated } from './obfuscate';

// Conditionally import Vercel KV only in production
let kv: any = null;

// Initialize KV storage in production
const initKV = async () => {
  if (process.env.KV_REST_API_URL && !kv) {
    const { kv: kvClient } = await import('@vercel/kv');
    kv = kvClient;
  }
};

// Check if we're using KV storage (production)
const useKV = () => {
  return process.env.NODE_ENV === 'production' && process.env.KV_REST_API_URL;
};

/**
 * Get the list of all hackathons
 */
export async function getHackathonsList(): Promise<HackathonsList> {
  if (useKV()) {
    await initKV();
    const data = await kv.get('hackathons-list');
    if (data) {
      return data as HackathonsList;
    }
    // If not in KV, fall back to filesystem (for initial setup)
    console.warn('Hackathons list not found in KV, falling back to filesystem');
  }
  
  // Filesystem fallback (development)
  const dataDir = path.join(process.cwd(), 'data');
  const hackathonsPath = path.join(dataDir, 'hackathons.json');
  const fileContents = await fs.readFile(hackathonsPath, 'utf8');
  return JSON.parse(fileContents);
}

/**
 * Save the list of all hackathons
 */
export async function saveHackathonsList(list: HackathonsList): Promise<void> {
  if (useKV()) {
    await initKV();
    await kv.set('hackathons-list', list);
  } else {
    // Filesystem (development)
    const dataDir = path.join(process.cwd(), 'data');
    const hackathonsPath = path.join(dataDir, 'hackathons.json');
    await fs.writeFile(hackathonsPath, JSON.stringify(list, null, 2), 'utf8');
  }
}

/**
 * Get hackathon data by ID
 */
export async function getHackathonData(hackathonId: string): Promise<HackathonData> {
  if (useKV()) {
    await initKV();
    const data = await kv.get(`hackathon:${hackathonId}`);
    if (data) {
      // Data in KV is already decoded
      return data as HackathonData;
    }
    // If not in KV, fall back to filesystem (for initial setup)
    console.warn(`Hackathon ${hackathonId} not found in KV, falling back to filesystem`);
  }

  // Filesystem fallback (development)
  const hackathonsList = await getHackathonsList();
  const hackathon = hackathonsList.hackathons.find(h => h.id === hackathonId);
  
  if (!hackathon) {
    throw new Error(`Hackathon ${hackathonId} not found`);
  }

  const dataDir = path.join(process.cwd(), 'data');
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

/**
 * Save hackathon data by ID
 */
export async function saveHackathonData(hackathonId: string, data: HackathonData): Promise<void> {
  // Encode scores before saving
  const dataToSave = {
    ...data,
    projects: data.projects.map(project => ({
      ...project,
      scores: encodeScores(project.scores as any)
    }))
  };

  if (useKV()) {
    await initKV();
    // Store decoded version in KV for faster access
    await kv.set(`hackathon:${hackathonId}`, data);
  } else {
    // Filesystem (development)
    const hackathonsList = await getHackathonsList();
    const hackathon = hackathonsList.hackathons.find(h => h.id === hackathonId);
    
    if (!hackathon) {
      throw new Error(`Hackathon ${hackathonId} not found`);
    }

    const dataDir = path.join(process.cwd(), 'data');
    const dataPath = path.join(dataDir, hackathon.dataFile);
    await fs.writeFile(dataPath, JSON.stringify(dataToSave, null, 2), 'utf8');
  }
}

/**
 * Initialize KV storage from filesystem data (run once during deployment)
 */
export async function seedKVFromFiles(): Promise<void> {
  if (!useKV()) {
    console.log('Not using KV storage, skipping seed');
    return;
  }

  await initKV();
  
  try {
    const dataDir = path.join(process.cwd(), 'data');
    
    // Seed hackathons list
    const hackathonsPath = path.join(dataDir, 'hackathons.json');
    const hackathonsData = await fs.readFile(hackathonsPath, 'utf8');
    const hackathonsList: HackathonsList = JSON.parse(hackathonsData);
    await kv.set('hackathons-list', hackathonsList);
    console.log('✓ Seeded hackathons list to KV');
    
    // Seed each hackathon's data
    for (const hackathon of hackathonsList.hackathons) {
      const dataPath = path.join(dataDir, hackathon.dataFile);
      const fileContents = await fs.readFile(dataPath, 'utf8');
      const rawData: any = JSON.parse(fileContents);
      
      // Decode scores for KV storage
      const data: HackathonData = {
        ...rawData,
        projects: rawData.projects.map((project: any) => ({
          ...project,
          scores: isObfuscated(project.scores) 
            ? decodeScores(project.scores)
            : project.scores
        }))
      };
      
      await kv.set(`hackathon:${hackathon.id}`, data);
      console.log(`✓ Seeded hackathon ${hackathon.id} to KV`);
    }
    
    console.log('✓ All data seeded to KV storage successfully');
  } catch (error) {
    console.error('Error seeding KV storage:', error);
    throw error;
  }
}

