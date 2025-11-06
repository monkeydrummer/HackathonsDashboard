# Hackathon Dashboard

A modern, interactive dashboard for displaying hackathon results with team pages, project details, scoring, and special awards. **Now supports multiple hackathons!**

## Features

- 🎯 **Multi-Hackathon Support** - Manage and display multiple hackathon events
- 🏆 **Top 3 Rankings** - Showcase winners with medals
- 📋 **Project Listings** - Alphabetically sorted projects beyond top 3
- 👥 **Team Pages** - Dedicated pages for each team showing all their projects
- 📊 **Score Breakdown** - Customizable categories scored on a 1-5 scale
- ⭐ **Special Awards** - Highlight exceptional achievements
- 📝 **Markdown Support** - Rich project descriptions with formatting
- 🔒 **Admin Interface** - Password-protected editing per hackathon
- 📱 **Responsive Design** - Works great on desktop, tablet, and mobile

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **React Markdown** for description rendering
- **Upstash Redis** for production data storage (editable in production!)
- **JSON** file-based storage for development

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser
4. Select a hackathon to view its results

## Navigation Structure

- **`/`** - Home page listing all hackathons
- **`/hackathon/[id]`** - Results for a specific hackathon (e.g., `/hackathon/2025-10-31`)
- **`/hackathon/[id]/team/[teamId]`** - Team detail page
- **`/hackathon/[id]/admin`** - Admin interface for that hackathon

## Admin Access

The admin interface is available at `/hackathon/[id]/admin` for each hackathon.

**Default password:** `hackathon2024`

Example: http://localhost:3000/hackathon/2025-10-31/admin

### Admin Features

- **⚖️ Score Categories** - Configure category weights to customize how overall scores are calculated
- **📋 Manage Projects** - Create new projects, assign to teams, and delete projects
- **👥 Manage Teams** - Create, edit, and delete teams and their members
- **🏆 Manage Awards** - Create and customize special awards
- **⚙️ Hackathon Settings** - Edit hackathon details and publish/unpublish results
- **📊 Edit Project Details** - Update scores, descriptions, and assign awards to projects
- **📝 Judges Notes** - Add markdown-formatted notes from judges (visible to all viewers)
- **✓ Review Status Indicators** - Visual indicators show which projects have been reviewed (✓) vs not yet reviewed (⚠)
- **Overall Scores Display** - See calculated overall scores in project list and editor panel (admin only)

### Score Privacy

- **All scores are private** - Only admins can view category scores and overall scores
- **Public viewers see** - Project rankings (when published), special awards, descriptions, and judges notes
- **Admins see** - All scores, review status, and can manage scoring weights

To change the password, create a `.env.local` file:

```env
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password
```

## Data Management

### Multi-Hackathon Structure

Data is organized to support multiple hackathons:

```
data/
├── hackathons.json           # List of all hackathons
└── 2025-10-31.json          # Data for each hackathon
```

**hackathons.json** - Registry of all hackathons:
```json
{
  "hackathons": [
    {
      "id": "2025-10-31",
      "name": "Halloween Hackathon 2025",
      "date": "2025-10-31",
      "description": "Description here",
      "dataFile": "2025-10-31.json"
    }
  ]
}
```

**[hackathon-id].json** - Data for a specific hackathon:
```json
{
  "teams": [/* team objects */],
  "projects": [/* project objects */],
  "config": {
    "categories": [/* scoring categories */],
    "specialAwards": [/* award names */]
  }
}
```

### Adding a New Hackathon

See **MULTI-HACKATHON-GUIDE.md** for detailed instructions on adding new hackathons.

## Adding Images

1. Place image files in `public/images/`
2. Reference them in the project's `images` array:
   ```json
   "images": ["screenshot1.png", "demo.gif"]
   ```

## Deployment to Vercel

> **⚠️ Important for Production Deployments**  
> Vercel's filesystem is read-only, so the admin interface won't be able to save changes using JSON files.  
> **Solution**: This project uses **Upstash Redis** (via Vercel Marketplace) for production deployments.

### 📘 Complete Deployment Guide

See **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** for comprehensive step-by-step instructions on:

- ✅ Deploying to Vercel with editable admin interface
- ✅ Setting up Upstash Redis via Vercel Marketplace (free tier: 256MB, 500K commands/month)
- ✅ Seeding your data to Redis
- ✅ Environment variables configuration
- ✅ Troubleshooting common issues

### Quick Steps

1. Push code to GitHub
2. Import to Vercel
3. Add Upstash Redis from Storage tab (Marketplace)
4. Redeploy
5. Seed the database (instructions in deployment guide)

### Environment Variables

Automatically set by Vercel when you connect Upstash Redis:

- **`UPSTASH_REDIS_REST_URL`** - Redis database URL
- **`UPSTASH_REDIS_REST_TOKEN`** - Authentication token

Optional (you set):

- **`NEXT_PUBLIC_ADMIN_PASSWORD`** - Your admin password (defaults to `hackathon2024`)

## Scoring System

Projects are scored on 5 categories (1-5 scale):
- **Amount of Work/Scope** - How much was accomplished
- **Polish (UI/UX)** - Quality and refinement
- **Fun/Usefulness** - Entertainment or practical value
- **Creativity** - Originality and innovation
- **Innovation** - Technical novelty

**Overall Score** = Average of all category scores

## Customization

### Changing Score Categories

Edit the `config.categories` array in `data/hackathon-data.json`:

```json
"categories": [
  {
    "id": "category-id",
    "label": "Display Name",
    "weight": 1
  }
]
```

### Adding Special Awards

Add award names to `config.specialAwards`:

```json
"specialAwards": [
  "Most Fun",
  "Best UI",
  "Your Custom Award"
]
```

### Styling

The app uses TailwindCSS. Modify styles in component files (`.tsx`) or update `tailwind.config.ts` for global theme changes.

## Project Structure

```
hackathon-dashboard/
├── app/
│   ├── page.tsx                           # Home page listing hackathons
│   ├── hackathon/[id]/
│   │   ├── page.tsx                       # Hackathon results page
│   │   ├── admin/page.tsx                 # Admin interface
│   │   └── team/[teamId]/page.tsx         # Team detail pages
│   └── api/data/route.ts                  # API for data operations
├── lib/
│   ├── types.ts                           # TypeScript types
│   ├── data.ts                            # Data access functions
│   └── utils.ts                           # Utility functions
├── data/
│   ├── hackathons.json                    # List of all hackathons
│   └── 2025-10-31.json                    # Individual hackathon data
└── public/
    └── images/                            # Project screenshots/gifs
```

## Tips for Best Results

1. **Add Project Descriptions** - Use markdown to make descriptions engaging
2. **Include Screenshots** - Visual content makes projects more compelling
3. **Score Consistently** - Use the same criteria for all projects
4. **Assign Special Awards** - Recognize unique achievements beyond scores
5. **Test on Mobile** - Ensure it looks great on all devices

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Markdown Documentation](https://github.com/remarkjs/react-markdown)

## License

This project is open source and available for use in your hackathon events.
