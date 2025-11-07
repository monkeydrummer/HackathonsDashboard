#!/usr/bin/env node

/**
 * Sync data from production (Upstash Redis) to local JSON files
 * 
 * Usage:
 *   node scripts/sync-from-production.js
 * 
 * This script will:
 * 1. Download data from your deployed site
 * 2. Save it to your local data/ folder
 * 3. Overwrite existing JSON files
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🔄 Sync Production Data to Local Files\n');
  console.log('This will download data from your deployed site and save it locally.');
  console.log('Your local JSON files will be OVERWRITTEN.\n');

  // Get production URL
  const productionUrl = await question('Enter your production URL (e.g., https://your-app.vercel.app): ');
  
  if (!productionUrl.trim()) {
    console.error('❌ Error: Production URL is required');
    rl.close();
    return;
  }

  // Get admin password
  const password = await question('Enter your admin password: ');
  
  if (!password.trim()) {
    console.error('❌ Error: Password is required');
    rl.close();
    return;
  }

  const baseUrl = productionUrl.trim().replace(/\/$/, '');

  try {
    console.log('\n📥 Downloading hackathons list...');
    
    // Download hackathons list
    const hackathonsResponse = await fetch(
      `${baseUrl}/api/export-data?password=${encodeURIComponent(password)}`
    );

    if (!hackathonsResponse.ok) {
      const error = await hackathonsResponse.json();
      throw new Error(error.error || 'Failed to download hackathons list');
    }

    const hackathonsList = await hackathonsResponse.json();
    
    // Save hackathons list
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(dataDir, 'hackathons.json'),
      JSON.stringify(hackathonsList, null, 2),
      'utf8'
    );
    console.log('✅ Saved: data/hackathons.json');

    // Download each hackathon's data
    for (const hackathon of hackathonsList.hackathons) {
      console.log(`📥 Downloading ${hackathon.name} (${hackathon.id})...`);
      
      const dataResponse = await fetch(
        `${baseUrl}/api/export-data?password=${encodeURIComponent(password)}&hackathonId=${hackathon.id}`
      );

      if (!dataResponse.ok) {
        console.error(`⚠️  Warning: Failed to download ${hackathon.id}`);
        continue;
      }

      const data = await dataResponse.json();
      
      fs.writeFileSync(
        path.join(dataDir, hackathon.dataFile),
        JSON.stringify(data, null, 2),
        'utf8'
      );
      console.log(`✅ Saved: data/${hackathon.dataFile}`);
    }

    console.log('\n✨ Sync complete! Your local files are now up to date.\n');
    console.log('💡 Tip: Commit these changes to Git to keep your repository in sync.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('- Make sure the production URL is correct');
    console.log('- Verify your admin password');
    console.log('- Check that your site is deployed and accessible');
  } finally {
    rl.close();
  }
}

main();

