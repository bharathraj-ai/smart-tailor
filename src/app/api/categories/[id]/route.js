import { NextResponse } from 'next/server';
import prisma from "@/lib/db";
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'tailor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Delete image from Mongo
    if (category.imageId) {
      const db = await getDb();
      try {
        await db.collection('images').deleteOne({ _id: new ObjectId(category.imageId) });
      } catch (err) {
        console.error('Error deleting image from Mongo:', err);
      }
    }

    // Delete category from Postgres
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ message: 'Category deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
