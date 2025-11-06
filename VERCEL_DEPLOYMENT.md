# Deploying to Vercel with Editable Data

This guide explains how to deploy the Hackathon Dashboard to Vercel with full admin editing capabilities.

## Problem

Vercel's filesystem is **read-only** in production, so the default JSON file storage won't work for editing data. This has been fixed by integrating **Vercel KV** (a Redis-based key-value store) for production data storage.

## Solution Overview

- **Development**: Uses JSON files in the `/data` folder
- **Production (Vercel)**: Uses Vercel KV storage for read/write capabilities
- **Automatic**: The app detects the environment and uses the appropriate storage method

## Deployment Steps

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Add Vercel KV support for production"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Click **"Deploy"** (don't worry about configuration yet)

### 3. Create a Vercel KV Database

1. In your Vercel dashboard, go to your project
2. Navigate to the **"Storage"** tab
3. Click **"Create Database"**
4. Select **"KV"** (Key-Value Store)
5. Name it something like `hackathon-dashboard-kv`
6. Click **"Create"**
7. **Connect it to your project** when prompted

> **Important**: Vercel will automatically add the required environment variables (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.) to your project. You don't need to set these manually!

### 4. Set Admin Password (Optional)

1. In your Vercel project dashboard, go to **"Settings" → "Environment Variables"**
2. Add a new variable:
   - **Name**: `NEXT_PUBLIC_ADMIN_PASSWORD`
   - **Value**: Your secure password (e.g., `mySecurePass123!`)
   - **Environment**: All (Production, Preview, and Development)
3. Click **"Save"**

> If you don't set this, the default password `hackathon2024` will be used.

### 5. Redeploy Your Application

After creating the KV database and setting environment variables:

1. Go to **"Deployments"** tab
2. Click on the **latest deployment**
3. Click the **"⋯"** menu (three dots)
4. Select **"Redeploy"**
5. Check **"Use existing Build Cache"** is unchecked
6. Click **"Redeploy"**

### 6. Seed Your KV Database

After the deployment completes, you need to copy your JSON data to the KV storage:

#### Option A: Using the API Endpoint (Recommended)

1. Open your deployed site: `https://your-app.vercel.app`
2. Open your browser's Developer Console (F12)
3. Run this command in the console:

```javascript
fetch('/api/seed-kv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'your-admin-password' })
})
.then(r => r.json())
.then(data => console.log(data));
```

Replace `'your-admin-password'` with your actual admin password.

#### Option B: Using cURL

```bash
curl -X POST https://your-app.vercel.app/api/seed-kv \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password"}'
```

You should see a success message: `"Successfully seeded KV storage from JSON files"`

### 7. Verify It Works

1. Go to your deployed site: `https://your-app.vercel.app`
2. Navigate to `/hackathon/[id]/admin` (e.g., `/hackathon/2025-10-31/admin`)
3. Log in with your admin password
4. Try editing a project and saving
5. Refresh the page - your changes should persist!

## How It Works

### Storage Layer

The app uses an intelligent storage abstraction (`lib/storage.ts`) that:

- **Detects the environment** based on `NODE_ENV` and presence of `KV_REST_API_URL`
- **In Development**: Reads/writes JSON files in `/data` folder
- **In Production**: Uses Vercel KV for all data operations
- **Automatic Fallback**: If data isn't in KV yet, falls back to reading from JSON files

### Data Flow

```
Development:
  ┌─────────────┐
  │  JSON Files │ ←→ API Routes ←→ Admin UI
  └─────────────┘

Production (Vercel):
  ┌─────────────┐
  │  Vercel KV  │ ←→ API Routes ←→ Admin UI
  └─────────────┘
```

## Environment Variables

### Automatically Set by Vercel (when you create KV database):
- `KV_REST_API_URL` - KV database URL
- `KV_REST_API_TOKEN` - Write access token
- `KV_REST_API_READ_ONLY_TOKEN` - Read-only token
- `KV_URL` - Alternative URL format

### You Need to Set:
- `NEXT_PUBLIC_ADMIN_PASSWORD` (optional) - Admin login password

## Troubleshooting

### "Failed to save data" errors in production

**Solution**: Make sure you've created the Vercel KV database and seeded it with data (Step 6).

### "Hackathon not found" after deployment

**Solution**: You need to seed the KV database. Run the seed script from Step 6.

### Changes not saving in production

**Checklist**:
1. ✅ Vercel KV database created?
2. ✅ KV database connected to your project?
3. ✅ Environment variables automatically added?
4. ✅ Redeployed after adding KV?
5. ✅ Seeded the KV database with initial data?

### How to check if KV is working

Run this in the browser console on your deployed site:

```javascript
fetch('/api/data?hackathonId=2025-10-31')
  .then(r => r.json())
  .then(data => console.log('Data loaded:', data));
```

If you see your hackathon data, KV is working!

## Adding New Hackathons

### During Development:
1. Add JSON files to `/data` folder as usual
2. Update `data/hackathons.json`
3. Test locally

### After Deploying to Production:
1. Make changes to JSON files locally
2. Commit and push to GitHub
3. Vercel will auto-deploy
4. **Important**: Run the seed script again to update KV with new data:

```javascript
fetch('/api/seed-kv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'your-admin-password' })
})
.then(r => r.json())
.then(data => console.log(data));
```

## Cost

- **Vercel KV Free Tier**: 256 MB storage, 3,000 commands/day
- Perfect for hackathon dashboards (way more than needed!)
- If you exceed limits, Vercel Pro plan is $20/month

## Alternative: Managing Data Entirely Through Admin UI

Once your data is in KV storage, you can:
1. Delete the JSON files from your repo (keep a backup!)
2. Manage everything through the admin interface
3. The data will persist in KV storage only

To backup your data from KV:
1. Use the admin interface to view all data
2. Or create a custom API endpoint to export data

## Need Help?

- Check [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- Check the [Vercel Dashboard](https://vercel.com/dashboard) for KV status
- Look at browser console for error messages
- Check Vercel deployment logs for server-side errors

## Summary

✅ **Development**: Edit JSON files directly  
✅ **Production**: Editable through admin UI via Vercel KV  
✅ **Zero downtime**: Changes save instantly  
✅ **Free tier**: Perfect for most hackathon dashboards  
✅ **Simple setup**: Just a few clicks in Vercel dashboard

