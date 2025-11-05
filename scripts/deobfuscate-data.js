// Script to deobfuscate scores in data files (for debugging/testing)
// Run with: node scripts/deobfuscate-data.js

const fs = require('fs');
const path = require('path');

const OBFUSCATION_KEY = 'rocscience-hackathon-2025';

function decodeScores(obfuscated) {
  try {
    const decoded = Buffer.from(obfuscated, 'base64').toString();
    const unxored = xorWithKey(decoded, OBFUSCATION_KEY);
    const json = Buffer.from(unxored, 'base64').toString();
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to decode:', error);
    return null;
  }
}

function xorWithKey(str, key) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

function deobfuscateDataFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.projects) {
    console.log('  No projects found, skipping.');
    return;
  }
  
  let count = 0;
  data.projects = data.projects.map(project => {
    if (project.scores && typeof project.scores === 'string') {
      count++;
      return {
        ...project,
        scores: decodeScores(project.scores)
      };
    }
    return project;
  });
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  ✓ Deobfuscated ${count} project scores`);
}

// Main
const dataDir = path.join(__dirname, '../data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'hackathons.json');

console.log('Deobfuscating scores in data files...\n');
files.forEach(file => {
  deobfuscateDataFile(path.join(dataDir, file));
});

console.log('\n✓ Done! All scores have been deobfuscated.');

