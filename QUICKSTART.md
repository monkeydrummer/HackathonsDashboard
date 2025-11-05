# Quick Start Guide

## Your Dashboard is Ready! 🎉

I've created a fully functional hackathon dashboard with all your data already imported.

### What's Been Created

✅ **18 Teams** imported from your CSV
✅ **20 Projects** with links and placeholders for descriptions
✅ **Home Page** with leaderboard and team cards
✅ **Team Pages** showing project details and scores
✅ **Admin Interface** for editing scores and descriptions
✅ **Responsive Design** that works on all devices

### Access the Dashboard

The development server should now be running at:
**http://localhost:3000**

### Next Steps

#### 1. Admin Access
- Navigate to **http://localhost:3000/admin**
- Default password: `hackathon2024`
- Start adding scores and project descriptions!

#### 2. Add Project Details
For each project:
- ✏️ Write a description (supports Markdown)
- 🎯 Enter scores for all 5 categories (1-5)
- 🏅 Assign special awards
- 📸 Add screenshots (see below)

#### 3. Add Screenshots/GIFs

To add images to projects:

1. Copy image files to: `hackathon-dashboard/public/images/`
2. In the admin, you'll need to manually edit `data/hackathon-data.json` to add image filenames:
   ```json
   "images": ["screenshot1.png", "demo.gif"]
   ```
3. Or edit the JSON file directly for bulk image additions

**Note:** For Anton & John's project, you can copy images from:
`C:\Users\JeremySmith\source\repos\Hackathons\Anton John`

#### 4. Customize (Optional)

- **Change score categories**: Edit `data/hackathon-data.json` → `config.categories`
- **Add special awards**: Edit `data/hackathon-data.json` → `config.specialAwards`
- **Change admin password**: Create `.env.local` with `NEXT_PUBLIC_ADMIN_PASSWORD=yourpassword`

### Scoring Categories

Each project is scored 1-5 in these categories:
1. **Amount of Work/Scope** - How much was accomplished
2. **Polish (UI/UX)** - Quality and refinement
3. **Fun/Usefulness** - Entertainment or practical value
4. **Creativity** - Originality of the idea
5. **Innovation** - Technical novelty

**Overall Score** = Average of all category scores

### Deploy to Vercel (When Ready)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Click "Deploy"
6. Done! Your dashboard is live 🚀

Or use Vercel CLI:
```bash
npm install -g vercel
vercel
```

### Keyboard Shortcuts

- **Ctrl+S** in admin interface saves changes automatically
- Click on team cards to view their projects
- All links open in new tabs

### Tips

💡 **Write engaging descriptions** - Use markdown for formatting
💡 **Add screenshots** - Visual content makes projects shine
💡 **Be consistent with scoring** - Use the same criteria for all
💡 **Assign special awards** - Recognize unique achievements
💡 **Test on mobile** - Make sure it looks great everywhere

### Troubleshooting

**Server won't start?**
```bash
cd hackathon-dashboard
npm install
npm run dev
```

**Changes not showing?**
- Refresh your browser (Ctrl+R or Cmd+R)
- Check the admin interface saved successfully

**Need to reset data?**
- Keep a backup of `data/hackathon-data.json`
- You can always restore from the backup

---

## Support

Need help? Check:
- `README.md` - Full documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Markdown Guide](https://www.markdownguide.org/basic-syntax/)

Have fun showcasing your hackathon results! 🏆



