import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'tailor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();

    // Fetch measurements joined with the user's name and email
    const { data: measurements, error } = await db
      .from('measurements')
      .select('*, user:users(name, email)')
      .order('createdAt', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ measurements: measurements || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching measurements:', error);
    return NextResponse.json({ error: 'Failed to fetch measurements' }, { status: 500 });
  }
}
