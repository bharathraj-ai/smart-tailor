import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// In-memory server-side image cache — survives across requests in the same
// process. Images are immutable after upload, so this is safe to cache
// indefinitely until process restart.
const imageCache = new Map();
const MAX_CACHE_SIZE = 50; // Limit to prevent unbounded memory growth

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    if (!id) {
      return NextResponse.json({ error: 'Invalid Image ID' }, { status: 400 });
    }

    // 1. Check in-memory cache first (instant — no DB call)
    if (imageCache.has(id)) {
      const cached = imageCache.get(id);
      return new NextResponse(cached.buffer, {
        headers: {
          'Content-Type': cached.mimeType,
          'Cache-Control': 'public, max-age=604800, immutable',
          'X-Cache': 'HIT',
        }
      });
    }

    // 2. Cache miss — fetch from DB
    const db = await getDb();

    const { data: imageDoc, error } = await db
      .from('images')
      .select('data')  // Only select the data column we need
      .eq('id', id)
      .single();

    if (error || !imageDoc || !imageDoc.data) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const base64Data = imageDoc.data;
    const matches = base64Data.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: 'Invalid image format in database' }, { status: 500 });
    }

    const mimeType = matches[1];
    const imageBuffer = Buffer.from(matches[2], 'base64');

    // 3. Store in memory cache (evict oldest if full)
    if (imageCache.size >= MAX_CACHE_SIZE) {
      const firstKey = imageCache.keys().next().value;
      imageCache.delete(firstKey);
    }
    imageCache.set(id, { buffer: imageBuffer, mimeType });

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=604800, immutable',
        'X-Cache': 'MISS',
      }
    });

  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}
