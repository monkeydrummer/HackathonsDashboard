# Recent Changes - Vercel Production Support

## Summary

Fixed the issue where the admin interface couldn't save changes in production on Vercel. The filesystem on Vercel is read-only, so the JSON file-based storage didn't work. Now the app uses **Vercel KV** (Redis key-value store) for production deployments while keeping JSON files for local development.

## What Changed

### 1. **New Dependencies**
- Added `@vercel/kv` package for cloud storage

### 2. **New Files**
- **`lib/storage.ts`** - Storage abstraction layer
  - Automatically uses Vercel KV in production
  - Falls back to JSON files in development
  - Handles data encoding/decoding
  - Includes seeding function to migrate data to KV

- **`app/api/seed-kv/route.ts`** - API endpoint to seed KV storage
  - Protected by admin password
  - Copies JSON data to Vercel KV
  - Called once after deployment

- **`VERCEL_DEPLOYMENT.md`** - Comprehensive deployment guide
  - Step-by-step Vercel deployment instructions
  - KV setup guide
  - Troubleshooting section
  - Environment variables documentation

- **`CHANGES.md`** - This file

### 3. **Modified Files**
- **`lib/data.ts`** - Simplified to use new storage layer
  - Now just re-exports functions from `storage.ts`
  - Maintains same API for backward compatibility

- **`app/api/hackathons/route.ts`** - Updated to use storage layer
  - Removed direct filesystem access
  - Now uses `saveHackathonsList` function

- **`README.md`** - Updated deployment section
  - Added warning about read-only filesystem
  - Links to comprehensive deployment guide
  - Updated tech stack

- **`app/hackathon/[id]/admin/page.tsx`** - Fixed UI issue
  - Added `text-gray-900` class to all input/textarea fields
  - Fixed light text on white background making text hard to read

## How It Works

### Development Mode
```
User edits → API routes → lib/storage.ts → JSON files in /data
```

### Production Mode (Vercel)
```
User edits → API routes → lib/storage.ts → Vercel KV (Redis)
```

The storage layer automatically detects the environment and uses the appropriate storage method:
- **Development**: Reads/writes JSON files
- **Production**: Reads/writes Vercel KV

## Migration Path

### For Existing Deployments:
1. Update your code from the repository
2. Run `npm install` to get `@vercel/kv`
3. Create a Vercel KV database in your Vercel dashboard
4. Redeploy the application
5. Seed the KV database using `/api/seed-kv` endpoint

### For New Deployments:
Follow the instructions in **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

## Benefits

✅ **Editable in Production** - Admin interface now works on Vercel  
✅ **No External Services** - Uses Vercel's built-in KV storage  
✅ **Free Tier Available** - Vercel KV free tier is generous  
✅ **Backward Compatible** - Local development still uses JSON files  
✅ **Automatic Detection** - No manual configuration needed  
✅ **Fast Performance** - Redis-based storage is very fast

## Costs

- **Vercel KV Free Tier**: 256 MB storage, 3,000 commands/day
- Perfect for hackathon dashboards (typical usage: <1 MB, <100 commands/day)
- If you exceed limits, upgrade to Vercel Pro ($20/month)

## Environment Variables

### Required for Production:
- `KV_REST_API_URL` - Automatically set by Vercel
- `KV_REST_API_TOKEN` - Automatically set by Vercel
- `KV_REST_API_READ_ONLY_TOKEN` - Automatically set by Vercel
- `KV_URL` - Automatically set by Vercel

### Optional:
- `NEXT_PUBLIC_ADMIN_PASSWORD` - Custom admin password (defaults to "hackathon2024")

## Testing

### Local Testing:
```bash
npm install
npm run dev
# Visit http://localhost:3000/hackathon/2025-10-31/admin
# Edit and save - changes persist in JSON files
```

### Production Testing:
1. Deploy to Vercel
2. Create KV database
3. Seed data using `/api/seed-kv`
4. Visit your deployed site's admin page
5. Edit and save - changes persist in Vercel KV

## Troubleshooting

See the **Troubleshooting** section in [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for common issues and solutions.

## Questions?

- Check [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions
- Check [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- Check browser console for client-side errors
- Check Vercel deployment logs for server-side errors

