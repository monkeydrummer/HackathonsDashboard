# Multi-Hackathon Dashboard Guide

Your dashboard now supports multiple hackathons! 🎉

## New Structure

### URLs
- **`/`** - Home page listing all hackathons
- **`/hackathon/[id]`** - Results for a specific hackathon
- **`/hackathon/[id]/team/[teamId]`** - Team details
- **`/hackathon/[id]/admin`** - Admin interface for that hackathon

### Data Files
```
data/
├── hackathons.json           # List of all hackathons
└── 2025-10-31.json          # Data for Halloween 2025 hackathon
```

## Current Hackathon

**Halloween Hackathon 2025**
- ID: `2025-10-31`
- URL: http://localhost:3000/hackathon/2025-10-31
- Admin: http://localhost:3000/hackathon/2025-10-31/admin

## Adding a New Hackathon

### Step 1: Create Data File

Create a new JSON file in `data/` folder (e.g., `data/2026-01-15.json`):

```json
{
  "teams": [],
  "projects": [],
  "config": {
    "categories": [
      {"id": "workScope", "label": "Amount of Work/Scope", "weight": 1},
      {"id": "polish", "label": "Polish (UI UX)", "weight": 1},
      {"id": "funUseful", "label": "Fun/Usefulness", "weight": 1},
      {"id": "creativity", "label": "Creativity", "weight": 1},
      {"id": "innovation", "label": "Innovation", "weight": 1}
    ],
    "specialAwards": [
      "Most Fun",
      "Best UI",
      "Most Likely To Be Used",
      "Most Innovative",
      "Best Technical Achievement"
    ]
  }
}
```

### Step 2: Register in hackathons.json

Add to `data/hackathons.json`:

```json
{
  "hackathons": [
    {
      "id": "2025-10-31",
      "name": "Halloween Hackathon 2025",
      "date": "2025-10-31",
      "description": "Our spooky Halloween hackathon featuring amazing projects from talented teams!",
      "dataFile": "2025-10-31.json"
    },
    {
      "id": "2026-01-15",
      "name": "Winter Innovation Hackathon 2026",
      "date": "2026-01-15",
      "description": "New year, new ideas! Our winter hackathon showcasing innovative solutions.",
      "dataFile": "2026-01-15.json"
    }
  ]
}
```

### Step 3: Import Data (Optional)

If you have a CSV file with data, follow the same process as before:
1. Export CSV with teams, projects, and links
2. Manually create the JSON structure in your new data file
3. Or copy/modify an existing hackathon's data file as a template

### Step 4: Deploy

The new hackathon will automatically appear on the home page!

## Managing Multiple Hackathons

### Navigation
- Users start at `/` and select which hackathon to view
- Each hackathon has its own independent data, teams, and projects
- Admin interface is per-hackathon (separate scoring for each event)

### Data Isolation
- Each hackathon has its own data file
- Scores, teams, and projects are completely separate
- You can have different categories and awards per hackathon

### Sharing Data
- To reuse teams across hackathons, copy the team objects
- Project data remains unique to each hackathon

## Example: Setting Up Q1 2026 Hackathon

```bash
# 1. Copy template
cp data/2025-10-31.json data/2026-q1.json

# 2. Edit data/2026-q1.json
# - Clear out teams and projects arrays
# - Keep the config or customize it

# 3. Add to data/hackathons.json
{
  "id": "2026-q1",
  "name": "Q1 2026 Innovation Sprint",
  "date": "2026-03-20",
  "description": "Spring into innovation with our Q1 hackathon!",
  "dataFile": "2026-q1.json"
}

# 4. Access at: /hackathon/2026-q1
```

## Tips

### Naming Convention
Use date-based IDs for easy sorting:
- `2025-10-31` (YYYY-MM-DD)
- `2026-q1` (year-quarter)
- `2026-spring` (year-season)

### Archiving Old Hackathons
Keep all hackathons accessible! Users can browse historical results. If you need to hide one temporarily, simply remove it from `hackathons.json` (but keep the data file).

### Bulk Operations
To update all hackathons at once:
1. Make changes to `data/hackathons.json`
2. Update individual data files as needed
3. Refresh the site

### Backup
Always backup your data files before major changes:
```bash
cp -r data data-backup-$(date +%Y%m%d)
```

## Advanced: Custom Categories Per Hackathon

Each hackathon can have its own scoring categories! Just edit the `config.categories` in that hackathon's data file:

```json
{
  "config": {
    "categories": [
      {"id": "speed", "label": "Development Speed", "weight": 1},
      {"id": "impact", "label": "Business Impact", "weight": 2},
      {"id": "design", "label": "Design Quality", "weight": 1}
    ],
    "specialAwards": ["Best Demo", "Most Practical"]
  }
}
```

## Questions?

- **Q: Can teams participate in multiple hackathons?**  
  A: Yes! Just add them to each hackathon's data file with the same or different team members.

- **Q: Can I import data from a previous hackathon?**  
  A: Yes, copy the data file and modify as needed for the new event.

- **Q: What happens if I delete a hackathon from hackathons.json?**  
  A: It won't appear on the home page, but the data file remains intact.

---

**You're all set to run multiple hackathons!** 🚀



