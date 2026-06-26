import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const db = await getDb();
    
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid Image ID' }, { status: 400 });
    }

    const imageDoc = await db.collection('images').findOne({ _id: objectId });

    if (!imageDoc || !imageDoc.data) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // data could be a base64 string starting with "data:image/jpeg;base64,..."
    const base64Data = imageDoc.data;
    const matches = base64Data.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: 'Invalid image format in database' }, { status: 500 });
    }

    const mimeType = matches[1];
    const imageBuffer = Buffer.from(matches[2], 'base64');

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400'
      }
    });

  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}
