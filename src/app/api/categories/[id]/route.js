import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'tailor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const db = await getDb();

    if (!id) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { data: category, error: selectError } = await db
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (selectError || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Delete image from database
    if (category.imageId) {
      try {
        await db
          .from('images')
          .delete()
          .eq('id', category.imageId);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    // Delete category
    const { error: deleteError } = await db
      .from('categories')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ message: 'Category deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
