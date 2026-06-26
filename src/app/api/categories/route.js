import { NextResponse } from 'next/server';
import prisma from "@/lib/db";
import { getDb } from '@/lib/mongo';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'tailor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, imageBase64 } = body;

    if (!name || !slug || !imageBase64) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Connect to MongoDB
    const db = await getDb();
    
    // Store image base64
    const result = await db.collection('images').insertOne({
      data: imageBase64,
      createdAt: new Date()
    });

    const imageId = result.insertedId.toString();

    // Create category in Postgres
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        imageId
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
