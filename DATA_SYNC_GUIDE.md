# Data Sync Guide - Production ↔️ Local

This guide explains how to keep your production data (Upstash Redis) and local data (JSON files) in sync.

## Understanding the Data Flow

### Local Development → Production
When you push changes from your local JSON files to production:

```
Local JSON files → Git → Vercel Deploy → Seed API → Upstash Redis
```

**Process:**
1. Edit JSON files locally
2. Commit and push to GitHub
3. Vercel auto-deploys
4. Run seed script to update Redis

### Production → Local Development
When you make edits in production and want to sync back:

```
Upstash Redis → Export API → Download → Local JSON files
```

**Process:**
1. Make edits via admin interface on deployed site
2. Download data using export API or sync script
3. Save to local JSON files
4. Commit to Git

---

## Method 1: Automatic Sync (Recommended)

Use the built-in sync script to automatically download and save all data.

### Step 1: Run the Sync Script

```bash
npm run sync
```

### Step 2: Follow the Prompts

The script will ask you for:
1. **Production URL**: Your deployed site (e.g., `https://your-app.vercel.app`)
2. **Admin Password**: Your admin password

### Step 3: Review Changes

The script will:
- ✅ Download `hackathons.json`
- ✅ Download all hackathon data files
- ✅ Overwrite local JSON files
- ✅ Show progress for each file

### Step 4: Commit Changes (Optional)

```bash
git add data/
git commit -m "Sync production data to local"
git push
```

---

## Method 2: Manual Download via Browser

If you prefer to download files manually:

### Download Hackathons List

Open in your browser:
```
https://your-app.vercel.app/api/export-data?password=your-password
```

This downloads `hackathons.json`. Save it to your `data/` folder.

### Download Specific Hackathon

Open in your browser:
```
https://your-app.vercel.app/api/export-data?password=your-password&hackathonId=2025-10-31
```

This downloads `2025-10-31.json`. Save it to your `data/` folder.

Replace:
- `your-app.vercel.app` with your actual domain
- `your-password` with your admin password
- `2025-10-31` with your hackathon ID

---

## Method 3: Using curl (Command Line)

### Download Hackathons List

```bash
curl "https://your-app.vercel.app/api/export-data?password=your-password" \
  -o data/hackathons.json
```

### Download Specific Hackathon

```bash
curl "https://your-app.vercel.app/api/export-data?password=your-password&hackathonId=2025-10-31" \
  -o data/2025-10-31.json
```

---

## Typical Workflows

### Workflow A: Edit Locally, Deploy to Production

**Best for:** Making bulk changes, adding new hackathons

1. Edit JSON files in `data/` folder
2. Test locally: `npm run dev`
3. Commit and push to GitHub
4. Vercel auto-deploys
5. Run seed script to update Redis:
   ```javascript
   fetch('/api/seed-kv', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ password: 'your-password' })
   }).then(r => r.json()).then(console.log);
   ```

### Workflow B: Edit in Production, Sync to Local

**Best for:** Quick score updates, description edits

1. Edit data via admin interface at `https://your-app.vercel.app/hackathon/[id]/admin`
2. Changes save to Upstash Redis automatically
3. When done editing, sync to local:
   ```bash
   npm run sync
   ```
4. Review changes locally: `npm run dev`
5. Commit to Git to backup:
   ```bash
   git add data/
   git commit -m "Sync production edits"
   git push
   ```

### Workflow C: Hybrid Approach

**Best for:** Complex projects with multiple editors

1. **JSON files** = Source of truth for structure (teams, projects, awards)
2. **Production admin** = Quick edits to scores and descriptions
3. **Periodic sync** = Run sync weekly to keep local files updated
4. **Version control** = Commit synced changes to track history

---

## When to Sync

### Sync Local → Production:
- ✅ After adding new hackathons
- ✅ After adding new teams/projects
- ✅ After restructuring data
- ✅ After changing award categories
- ✅ When deploying for the first time

### Sync Production → Local:
- ✅ After judges enter scores in admin UI
- ✅ After updating project descriptions via admin
- ✅ Before making local edits (to get latest data)
- ✅ For backup/version control
- ✅ Periodically (weekly/monthly)

---

## Data Safety

### Backups

Both methods provide backup:
- **Local JSON files** = Version-controlled in Git
- **Upstash Redis** = Persisted in cloud database

### Avoiding Conflicts

1. **Don't edit in both places at once** - Choose one workflow per session
2. **Sync before local edits** - Always sync production → local before making local changes
3. **Sync after production edits** - Always sync production → local after editing via admin
4. **Commit often** - Commit synced data to Git for history

### Resolving Conflicts

If you accidentally edit in both places:

1. **Decide which is source of truth:**
   - Production more recent? → Sync production to local
   - Local more recent? → Push local to production (commit, deploy, re-seed)

2. **Manual merge:**
   - Download production data to separate folder
   - Compare with local files
   - Manually merge changes
   - Upload merged version

---

## API Reference

### GET /api/export-data

**Export hackathons list:**
```
GET /api/export-data?password=your-password
```

**Export specific hackathon:**
```
GET /api/export-data?password=your-password&hackathonId=2025-10-31
```

**Response:** Downloads JSON file

### POST /api/export-data

**Export all data:**
```javascript
fetch('/api/export-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'your-password' })
})
.then(r => r.json())
.then(data => console.log(data));
```

**Response:** JSON object with all hackathons and their data

---

## Troubleshooting

### "Unauthorized: Invalid password"
- ✅ Check your admin password is correct
- ✅ Make sure you're using the right password (check Vercel env vars)

### "Failed to download data"
- ✅ Verify production URL is correct
- ✅ Make sure site is deployed and accessible
- ✅ Check your internet connection

### Script hangs or doesn't respond
- ✅ Press Ctrl+C to cancel
- ✅ Check production site is responding
- ✅ Try manual download method instead

### Data looks corrupted after sync
- ✅ Check Git history for previous version
- ✅ Re-download from production
- ✅ Verify production data in admin interface

---

## Best Practices

1. **Sync regularly** - Don't let local and production drift too far
2. **Commit synced data** - Keep Git history of production changes
3. **Test locally** - Always test with `npm run dev` after syncing
4. **Use one workflow** - Stick to local-first OR production-first editing
5. **Document edits** - Use meaningful commit messages
6. **Backup before major changes** - Download production data before big updates

---

## Security Note

The export API is protected by your admin password. Keep your password secure and don't share export URLs (they contain the password in the query string).

For sensitive data, consider:
- Using environment variables for passwords
- Not committing sensitive data to Git
- Using private repositories
- Adding IP restrictions in Upstash/Vercel

---

## Summary

**Quick Reference:**

```bash
# Sync production to local (automatic)
npm run sync

# Seed local to production (after deploying)
# Run in browser console on deployed site:
fetch('/api/seed-kv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'your-password' })
}).then(r => r.json()).then(console.log);
```

**Remember:** 
- Local changes → Commit, push, deploy, seed
- Production changes → Sync to local, commit

Happy hacking! 🚀

