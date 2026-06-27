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

    const { data: customersData, error: fetchError } = await db
      .from('users')
      .select('*')
      .eq('role', 'customer')
      .order('createdAt', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    const customers = customersData || [];

    // Enrich with order and measurement counts
    for (const customer of customers) {
      // Get orders count
      const { count: orderCount } = await db
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('userId', customer.id);

      // Get measurements count
      const { count: measurementCount } = await db
        .from('measurements')
        .select('*', { count: 'exact', head: true })
        .eq('userId', customer.id);

      customer._count = {
        orders: orderCount || 0,
        measurements: measurementCount || 0
      };
    }

    return NextResponse.json({ customers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
