# Recent Changes - Vercel Production Support

## Latest Update (November 2025)

**Migrated from deprecated Vercel KV to Upstash Redis**

- Vercel KV was deprecated in June 2025 and replaced with Marketplace integrations
- Updated to use `@upstash/redis` package instead of `@vercel/kv`
- Changed environment variables to `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Updated deployment documentation with current 2025 Vercel Marketplace process
- **Free tier**: 256MB storage, 500K commands/month (more generous than old Vercel KV!)

## Original Implementation

Fixed the issue where the admin interface couldn't save changes in production on Vercel. The filesystem on Vercel is read-only, so the JSON file-based storage didn't work. Now the app uses **Upstash Redis** (via Vercel Marketplace) for production deployments while keeping JSON files for local development.

## What Changed

### 1. **New Dependencies**
- Added `@upstash/redis` package for cloud storage (previously `@vercel/kv` - now deprecated)

### 2. **New Files**
- **`lib/storage.ts`** - Storage abstraction layer
  - Automatically uses Upstash Redis in production
  - Falls back to JSON files in development
  - Handles data encoding/decoding
  - Includes seeding function to migrate data to Redis

- **`app/api/seed-kv/route.ts`** - API endpoint to seed Redis storage
  - Protected by admin password
  - Copies JSON data to Upstash Redis
  - Called once after deployment

- **`VERCEL_DEPLOYMENT.md`** - Comprehensive deployment guide
  - Step-by-step Vercel deployment instructions
  - Upstash Redis setup via Marketplace
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
User edits → API routes → lib/storage.ts → Upstash Redis
```

The storage layer automatically detects the environment and uses the appropriate storage method:
- **Development**: Reads/writes JSON files
- **Production**: Reads/writes Upstash Redis

## Migration Path

### For Existing Deployments:
1. Update your code from the repository
2. Run `npm install` to get `@upstash/redis`
3. Connect Upstash Redis from Vercel Marketplace (Storage tab)
4. Redeploy the application
5. Seed the Redis database using `/api/seed-kv` endpoint

### For New Deployments:
Follow the instructions in **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

## Benefits

✅ **Editable in Production** - Admin interface now works on Vercel  
✅ **Marketplace Integration** - Easy setup via Vercel Marketplace  
✅ **Generous Free Tier** - 256MB storage, 500K commands/month  
✅ **Backward Compatible** - Local development still uses JSON files  
✅ **Automatic Detection** - No manual configuration needed  
✅ **Fast Performance** - Redis-based storage is very fast  
✅ **Better Support** - Upstash actively maintained (Vercel KV deprecated)

## Costs

- **Upstash Redis Free Tier**: 256 MB storage, 500,000 commands/month
- Perfect for hackathon dashboards (typical usage: <1 MB, <20,000 commands/month)
- If you exceed limits: $0.20 per 100K additional commands (pay-as-you-go)

## Environment Variables

### Required for Production:
- `UPSTASH_REDIS_REST_URL` - Automatically set by Vercel/Upstash
- `UPSTASH_REDIS_REST_TOKEN` - Automatically set by Vercel/Upstash

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
2. Connect Upstash Redis from Marketplace
3. Seed data using `/api/seed-kv`
4. Visit your deployed site's admin page
5. Edit and save - changes persist in Upstash Redis

## Troubleshooting

See the **Troubleshooting** section in [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for common issues and solutions.

## Questions?

- Check [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions
- Check [Upstash Redis Documentation](https://docs.upstash.com/redis)
- Check [Vercel Storage Documentation](https://vercel.com/docs/storage)
- Check browser console for client-side errors
- Check Vercel deployment logs for server-side errors

