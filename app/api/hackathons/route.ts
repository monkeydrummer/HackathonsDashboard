import { NextResponse } from 'next/server';
import { getHackathonsList } from '@/lib/data';
import { promises as fs } from 'fs';
import path from 'path';

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
    const hackathonsPath = path.join(process.cwd(), 'data', 'hackathons.json');
    await fs.writeFile(hackathonsPath, JSON.stringify(hackathonsList, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save hackathons' }, { status: 500 });
  }
}



