import { NextResponse } from 'next/server';
import { getHackathonsList, saveHackathonsList } from '@/lib/data';

export async function GET() {
  try {
    const list = await getHackathonsList();
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load hackathons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const hackathonsList = await request.json();
    await saveHackathonsList(hackathonsList);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save hackathons' }, { status: 500 });
  }
}



