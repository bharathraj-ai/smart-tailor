'use client';

import { useState, useEffect } from 'react';
import { cachedFetch } from '@/lib/apiCache';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Package,
  Scissors
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const statusColors = {
  'Order Received': 'bg-yellow-500/20 text-yellow-400',
  'In Stitching': 'bg-blue-500/20 text-blue-400',
  'Quality Check': 'bg-purple-500/20 text-purple-400',
  'Ready for Delivery': 'bg-emerald-500/20 text-emerald-400',
  'Delivered': 'bg-green-500/20 text-green-400',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Cache for 5 minutes — avoids hitting the DB on every page visit.
      const json = await cachedFetch('/api/admin/stats', {}, 300);
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><p className="text-muted-foreground">Loading dashboard...</p></div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center p-12"><p className="text-muted-foreground">Failed to load dashboard data.</p></div>;
  }

  const stats = [
    { title: "Total Revenue", value: `₹${data.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign },
    { title: "Active Orders", value: String(data.totalOrders || 0), icon: ShoppingBag },
    { title: "Total Customers", value: String(data.customerCount || 0), icon: Users },
    { title: "In Stitching", value: String(data.inStitching || 0), icon: Activity },
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, Admin. Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-foreground tracking-tight mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
              <p className="text-sm text-muted-foreground">Last 7 days earnings</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Categories Bar Chart */}
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Top Categories</h3>
            <p className="text-sm text-muted-foreground">Most ordered categories</p>
          </div>
          <div className="h-[300px] w-full">
            {data.categoryData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{fill: 'var(--muted)'}}
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No category data yet</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <div className="grid grid-cols-1 gap-6">
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
            <a href="/admin/orders" className="text-sm text-primary font-medium hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(data.recentOrders || []).map((order, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{order.id}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{order.customer}</td>
                    <td className="px-6 py-4 text-muted-foreground">{order.product}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground text-right">{order.amount}</td>
                  </tr>
                ))}
                {(data.recentOrders || []).length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
