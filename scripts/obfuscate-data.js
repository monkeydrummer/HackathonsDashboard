// Script to obfuscate scores in data files
// Run with: node scripts/obfuscate-data.js

const fs = require('fs');
const path = require('path');

const OBFUSCATION_KEY = 'rocscience-hackathon-2025';

function encodeScores(scores) {
  const json = JSON.stringify(scores);
  const encoded = Buffer.from(json).toString('base64');
  const xored = xorWithKey(encoded, OBFUSCATION_KEY);
  return Buffer.from(xored).toString('base64');
}

function xorWithKey(str, key) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

function obfuscateDataFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.projects) {
    console.log('  No projects found, skipping.');
    return;
  }
  
  let count = 0;
  data.projects = data.projects.map(project => {
    if (project.scores && typeof project.scores === 'object') {
      count++;
      return {
        ...project,
        scores: encodeScores(project.scores)
      };
    }
    return project;
  });
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  ✓ Obfuscated ${count} project scores`);
}

// Main
const dataDir = path.join(__dirname, '../data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'hackathons.json');

console.log('Obfuscating scores in data files...\n');
files.forEach(file => {
  obfuscateDataFile(path.join(dataDir, file));
});

console.log('\n✓ Done! All scores have been obfuscated.');
console.log('Note: The scores are now encoded strings instead of objects.');

