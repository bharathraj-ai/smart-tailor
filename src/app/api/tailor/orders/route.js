import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const db = await getDb();

    const { data: user } = await db
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (!user || user.role !== 'tailor') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    // Get all orders in one query
    const { data: ordersData } = await db
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });

    const orders = ordersData || [];

    if (orders.length === 0) {
      return new Response(JSON.stringify({ orders: [] }), {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    // Batch fetch all users for these orders in ONE query (eliminates N+1)
    const userIds = [...new Set(orders.map(o => o.userId).filter(Boolean))];
    const { data: usersData } = await db
      .from('users')
      .select('*')
      .in('id', userIds);

    const usersMap = {};
    (usersData || []).forEach(u => { usersMap[u.id] = u; });

    // Batch fetch all order items in ONE query (eliminates N+1)
    const orderIds = orders.map(o => o.id);
    const { data: allItems } = await db
      .from('orderItems')
      .select('*')
      .in('orderId', orderIds);

    const itemsByOrder = {};
    (allItems || []).forEach(item => {
      if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
      itemsByOrder[item.orderId].push(item);
    });

    // Batch fetch all measurements in ONE query (eliminates N+1)
    const measurementIds = [...new Set(
      (allItems || []).map(i => i.measurementId).filter(Boolean)
    )];
    let measurementsMap = {};
    if (measurementIds.length > 0) {
      const { data: measurementsData } = await db
        .from('measurements')
        .select('*')
        .in('id', measurementIds);

      (measurementsData || []).forEach(m => { measurementsMap[m.id] = m; });
    }

    // Assemble the enriched orders
    for (const order of orders) {
      order.user = usersMap[order.userId] || null;
      const items = itemsByOrder[order.id] || [];
      for (const item of items) {
        item.measurement = item.measurementId ? (measurementsMap[item.measurementId] || null) : null;
      }
      order.items = items;
    }

    return new Response(JSON.stringify({ orders }), {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
