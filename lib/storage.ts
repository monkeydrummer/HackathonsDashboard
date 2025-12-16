import { promises as fs } from 'fs';
import path from 'path';
import { HackathonData, HackathonsList } from './types';
import { decodeScores, encodeScores, isObfuscated } from './obfuscate';

// Conditionally import Upstash Redis only in production
let redis: any = null;

// Initialize Redis storage in production
const initRedis = async () => {
  if (process.env.UPSTASH_REDIS_REST_URL && !redis) {
    const { Redis } = await import('@upstash/redis');
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
};

// Check if we're using Redis storage (production)
const useRedis = () => {
  return process.env.NODE_ENV === 'production' && process.env.UPSTASH_REDIS_REST_URL;
};

/**
 * Get the list of all hackathons
 */
export async function getHackathonsList(): Promise<HackathonsList> {
  if (useRedis()) {
    await initRedis();
    const data = await redis.get('hackathons-list');
    if (data) {
      return data as HackathonsList;
    }
    // If not in Redis, fall back to filesystem (for initial setup)
    console.warn('Hackathons list not found in Redis, falling back to filesystem');
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
  if (useRedis()) {
    await initRedis();
    await redis.set('hackathons-list', list);
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
  if (useRedis()) {
    await initRedis();
    const data = await redis.get(`hackathon:${hackathonId}`);
    if (data) {
      // Data in Redis is already decoded
      return data as HackathonData;
    }
    // If not in Redis, fall back to filesystem (for initial setup)
    console.warn(`Hackathon ${hackathonId} not found in Redis, falling back to filesystem`);
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

  if (useRedis()) {
    await initRedis();
    // Store decoded version in Redis for faster access
    await redis.set(`hackathon:${hackathonId}`, data);
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
 * Initialize Redis storage from filesystem data (run once during deployment)
 */
export async function seedRedisFromFiles(): Promise<void> {
  if (!useRedis()) {
    console.log('Not using Redis storage, skipping seed');
    return;
  }

  await initRedis();
  
  try {
    const dataDir = path.join(process.cwd(), 'data');
    
    // Seed hackathons list
    const hackathonsPath = path.join(dataDir, 'hackathons.json');
    const hackathonsData = await fs.readFile(hackathonsPath, 'utf8');
    const hackathonsList: HackathonsList = JSON.parse(hackathonsData);
    await redis.set('hackathons-list', hackathonsList);
    console.log('✓ Seeded hackathons list to Redis');
    
    // Seed each hackathon's data
    for (const hackathon of hackathonsList.hackathons) {
      const dataPath = path.join(dataDir, hackathon.dataFile);
      const fileContents = await fs.readFile(dataPath, 'utf8');
      const rawData: any = JSON.parse(fileContents);
      
      // Decode scores for Redis storage
      const data: HackathonData = {
        ...rawData,
        projects: rawData.projects.map((project: any) => ({
          ...project,
          scores: isObfuscated(project.scores) 
            ? decodeScores(project.scores)
            : project.scores
        }))
      };
      
      await redis.set(`hackathon:${hackathon.id}`, data);
      console.log(`✓ Seeded hackathon ${hackathon.id} to Redis`);
    }
    
    console.log('✓ All data seeded to Redis storage successfully');
  } catch (error) {
    console.error('Error seeding Redis storage:', error);
    throw error;
  }
}

// Keep the old function name for backward compatibility
export const seedKVFromFiles = seedRedisFromFiles;

