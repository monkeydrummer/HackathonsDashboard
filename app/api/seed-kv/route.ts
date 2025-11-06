import { NextResponse } from 'next/server';
import { seedKVFromFiles } from '@/lib/storage';
import { verifyPassword } from '@/lib/auth';

/**
 * API endpoint to seed Vercel KV storage from JSON files
 * This should be called once after deploying to Vercel and setting up KV
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

    // Check if KV is configured
    if (!process.env.KV_REST_API_URL) {
      return NextResponse.json(
        { 
          error: 'KV storage is not configured. Please set up Vercel KV first.',
          message: 'Visit your Vercel dashboard → Storage → Create KV Database'
        },
        { status: 400 }
      );
    }

    // Seed the data
    await seedKVFromFiles();

    return NextResponse.json({
      success: true,
      message: 'Successfully seeded KV storage from JSON files'
    });
  } catch (error) {
    console.error('Error seeding KV:', error);
    return NextResponse.json(
      { 
        error: 'Failed to seed KV storage',
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
      error: 'Method not allowed. Use POST with admin password to seed KV storage.',
      usage: 'POST /api/seed-kv with body: { "password": "your-admin-password" }'
    },
    { status: 405 }
  );
}

