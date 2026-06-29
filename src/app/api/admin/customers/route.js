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

    // Select only needed columns — explicitly exclude password
    const { data: customersData, error: fetchError } = await db
      .from('users')
      .select('id, name, email, phone, role, address, createdAt')
      .eq('role', 'customer')
      .order('createdAt', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    const customers = customersData || [];

    if (customers.length > 0) {
      // Batch fetch all orders and measurements in 2 queries (eliminates N+1)
      const customerIds = customers.map(c => c.id);

      const [ordersResult, measurementsResult] = await Promise.all([
        db.from('orders').select('userId').in('userId', customerIds),
        db.from('measurements').select('userId').in('userId', customerIds),
      ]);

      // Count per customer
      const orderCounts = {};
      (ordersResult.data || []).forEach(o => {
        orderCounts[o.userId] = (orderCounts[o.userId] || 0) + 1;
      });
      const measurementCounts = {};
      (measurementsResult.data || []).forEach(m => {
        measurementCounts[m.userId] = (measurementCounts[m.userId] || 0) + 1;
      });

      for (const customer of customers) {
        customer._count = {
          orders: orderCounts[customer.id] || 0,
          measurements: measurementCounts[customer.id] || 0,
        };
      }
    }

    return NextResponse.json({ customers }, {
      status: 200,
      headers: { 'Cache-Control': 'private, max-age=120' },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
