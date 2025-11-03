import { NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hackathonId = searchParams.get('hackathonId');
    
    if (!hackathonId) {
      return NextResponse.json({ error: 'hackathonId is required' }, { status: 400 });
    }
    
    const data = await getData(hackathonId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { hackathonId, data } = await request.json();
    
    if (!hackathonId) {
      return NextResponse.json({ error: 'hackathonId is required' }, { status: 400 });
    }
    
    await saveData(hackathonId, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
