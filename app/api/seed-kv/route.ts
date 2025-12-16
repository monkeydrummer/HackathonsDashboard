import { NextResponse } from 'next/server';
import { seedKVFromFiles } from '@/lib/storage';
import { verifyPassword } from '@/lib/auth';

/**
 * API endpoint to seed Upstash Redis storage from JSON files
 * This should be called once after deploying to Vercel and setting up Upstash Redis
 * 
 * Usage: POST /api/seed-kv with { "password": "your-admin-password" }
 */
export async function POST(request: Request) {
  try {
    // Verify admin password for security
    const { password } = await request.json();
    
    if (!password || !verifyPassword(password)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid password' },
        { status: 401 }
      );
    }

    // Check if Redis is configured
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      return NextResponse.json(
        { 
          error: 'Redis storage is not configured. Please set up Upstash Redis first.',
          message: 'Visit your Vercel dashboard → Storage → Create Database → Upstash Redis'
        },
        { status: 400 }
      );
    }

    // Seed the data
    await seedKVFromFiles();

    return NextResponse.json({
      success: true,
      message: 'Successfully seeded Redis storage from JSON files'
    });
  } catch (error) {
    console.error('Error seeding Redis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to seed Redis storage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Prevent GET requests
export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST with admin password to seed Redis storage.',
      usage: 'POST /api/seed-kv with body: { "password": "your-admin-password" }'
    },
    { status: 405 }
  );
}

