import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const db = await getDb();
    const { data: categories } = await db
      .from('categories')
      .select('*')
      .order('createdAt', { ascending: false });

    return NextResponse.json({ categories: categories || [] }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      }
    });
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
    const { name, slug, price, imageBase64 } = body;

    if (!name || !slug || !imageBase64) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const db = await getDb();

    // Store image
    const { data: imageResult, error: imageError } = await db
      .from('images')
      .insert([
        {
          data: imageBase64,
        }
      ])
      .select()
      .single();

    if (imageError) {
      throw imageError;
    }

    const imageId = imageResult.id;

    // Create category
    const { data: newCategory, error: categoryError } = await db
      .from('categories')
      .insert([
        {
          name,
          slug,
          price: price ? parseFloat(price) : 999,
          imageId,
        }
      ])
      .select()
      .single();

    if (categoryError) {
      throw categoryError;
    }

    return NextResponse.json({ category: newCategory }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
