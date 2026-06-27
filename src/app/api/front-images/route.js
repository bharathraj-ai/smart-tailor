import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const db = await getDb();
    const { data: settings } = await db
      .from('siteSettings')
      .select('*')
      .eq('key', 'heroImages')
      .maybeSingle();

    return NextResponse.json({ images: settings?.images || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching front images:', error);
    return NextResponse.json({ error: 'Failed to fetch front images' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'tailor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { imageBase64, label } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Missing image' }, { status: 400 });
    }

    const db = await getDb();

    // Store image in images table
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

    // Get current hero images
    const { data: currentSettings } = await db
      .from('siteSettings')
      .select('*')
      .eq('key', 'heroImages')
      .maybeSingle();

    const images = currentSettings?.images || [];
    images.push({
      imageId,
      label: label || 'Hero Image',
      createdAt: new Date().toISOString()
    });

    // Upsert the updated array back to siteSettings
    const { error: upsertError } = await db
      .from('siteSettings')
      .upsert({
        id: currentSettings?.id,
        key: 'heroImages',
        images,
      });

    if (upsertError) {
      throw upsertError;
    }

    return NextResponse.json({ imageId, label }, { status: 201 });
  } catch (error) {
    console.error('Error adding front image:', error);
    return NextResponse.json({ error: 'Failed to add front image' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'tailor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json({ error: 'Missing imageId' }, { status: 400 });
    }

    const db = await getDb();

    // Remove from siteSettings
    const { data: currentSettings } = await db
      .from('siteSettings')
      .select('*')
      .eq('key', 'heroImages')
      .maybeSingle();

    if (currentSettings) {
      let images = currentSettings.images || [];
      images = images.filter(img => img.imageId !== imageId);

      const { error: updateError } = await db
        .from('siteSettings')
        .upsert({
          id: currentSettings.id,
          key: 'heroImages',
          images,
        });

      if (updateError) {
        throw updateError;
      }
    }

    // Delete the image document
    const { error: deleteError } = await db
      .from('images')
      .delete()
      .eq('id', imageId);

    if (deleteError) {
      console.error('Error deleting image doc:', deleteError.message);
    }

    return NextResponse.json({ message: 'Image deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting front image:', error);
    return NextResponse.json({ error: 'Failed to delete front image' }, { status: 500 });
  }
}
