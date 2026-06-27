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

    // Parallel fetch: orders + customer count at the same time
    const [ordersResult, customerResult] = await Promise.all([
      db.from('orders').select('*').order('createdAt', { ascending: false }),
      db.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    ]);

    const orders = ordersResult.data || [];
    const customerCount = customerResult.count || 0;

    if (orders.length === 0) {
      return NextResponse.json({
        totalRevenue: 0, totalOrders: 0, customerCount, inStitching: 0,
        recentOrders: [], revenueData: [], categoryData: [],
      }, { status: 200, headers: { 'Cache-Control': 'private, max-age=120' } });
    }

    // Batch fetch users and items in 2 queries (eliminates N+1)
    const userIds = [...new Set(orders.map(o => o.userId).filter(Boolean))];
    const orderIds = orders.map(o => o.id);

    const [usersResult, itemsResult] = await Promise.all([
      db.from('users').select('id, name').in('id', userIds),
      db.from('orderItems').select('*').in('orderId', orderIds),
    ]);

    const usersMap = {};
    (usersResult.data || []).forEach(u => { usersMap[u.id] = u; });

    const itemsByOrder = {};
    (itemsResult.data || []).forEach(item => {
      if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
      itemsByOrder[item.orderId].push(item);
    });

    // Assemble enriched orders
    for (const order of orders) {
      order.user = usersMap[order.userId] ? { name: usersMap[order.userId].name } : null;
      order.items = itemsByOrder[order.id] || [];
    }

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;

    // Status counts
    const statusCounts = {};
    orders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    const inStitching = (statusCounts['In Stitching'] || 0) + (statusCounts['Quality Check'] || 0);

    // Recent orders (top 5)
    const recentOrders = orders.slice(0, 5).map(o => ({
      id: '#ORD-' + o.id.substring(0, 4).toUpperCase(),
      customer: o.user?.name || 'N/A',
      product: o.items?.[0]?.category || 'Custom Item',
      amount: '₹' + o.totalAmount,
      status: o.status,
    }));

    // Weekly revenue (last 7 days)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const dayOrders = orders.filter(o => {
        const created = new Date(o.createdAt);
        return created >= dayStart && created <= dayEnd;
      });
      const dayTotal = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      revenueData.push({ name: weekDays[dayStart.getDay()], total: dayTotal });
    }

    // Category breakdown
    const catMap = {};
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        const cat = item.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
    });
    const categoryData = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return NextResponse.json({
      totalRevenue, totalOrders, customerCount, inStitching,
      recentOrders, revenueData, categoryData,
    }, {
      status: 200,
      headers: { 'Cache-Control': 'private, max-age=120' },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
