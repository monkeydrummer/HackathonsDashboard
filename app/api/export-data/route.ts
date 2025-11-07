import { NextResponse } from 'next/server';
import { getHackathonsList, getData } from '@/lib/data';
import { verifyPassword } from '@/lib/auth';
import { encodeScores } from '@/lib/obfuscate';

/**
 * API endpoint to export all data from production (Redis) back to JSON format
 * This allows you to sync production changes back to your local development files
 * 
 * Usage: GET /api/export-data?password=your-admin-password&hackathonId=2025-10-31
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');
    const hackathonId = searchParams.get('hackathonId');

    // Verify admin password for security
    if (!password || !verifyPassword(password)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid password' },
        { status: 401 }
      );
    }

    // If hackathonId provided, export single hackathon
    if (hackathonId) {
      const data = await getData(hackathonId);
      
      // Encode scores for privacy (same as stored in JSON files)
      const exportData = {
        ...data,
        projects: data.projects.map(project => ({
          ...project,
          scores: encodeScores(project.scores as any)
        }))
      };

      // Return as downloadable JSON
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${hackathonId}.json"`,
        },
      });
    }

    // If no hackathonId, export the hackathons list
    const hackathonsList = await getHackathonsList();
    
    return new NextResponse(JSON.stringify(hackathonsList, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="hackathons.json"',
      },
    });

  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to export data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to export all hackathons at once
 * Returns a JSON object with all data
 */
export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Verify admin password for security
    if (!password || !verifyPassword(password)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid password' },
        { status: 401 }
      );
    }

    // Get all hackathons
    const hackathonsList = await getHackathonsList();
    
    // Export all hackathon data
    const allData: any = {
      hackathons: hackathonsList,
      data: {}
    };

    for (const hackathon of hackathonsList.hackathons) {
      const data = await getData(hackathon.id);
      
      // Encode scores for privacy
      const exportData = {
        ...data,
        projects: data.projects.map(project => ({
          ...project,
          scores: encodeScores(project.scores as any)
        }))
      };

      allData.data[hackathon.id] = exportData;
    }

    return NextResponse.json({
      success: true,
      message: 'Data exported successfully',
      data: allData
    });

  } catch (error) {
    console.error('Error exporting all data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to export data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

