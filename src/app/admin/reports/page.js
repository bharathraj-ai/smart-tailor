'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, IndianRupee, ShoppingBag, Users, Calendar, Download } from 'lucide-react';
import { cachedFetch } from '@/lib/apiCache';

export default function AdminReportsPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchOrders(), fetchCustomers()]).finally(() => setLoading(false));
  }, []);

  const fetchOrders = async () => {
    try {
      // Shared cache key — already populated if orders page was visited first.
      const data = await cachedFetch('/api/tailor/orders', {}, 120);
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await cachedFetch('/api/admin/customers', {}, 300);
      setCustomers(data.customers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const totalRevenue = useMemo(() => orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0), [orders]);
  const avgOrderValue = useMemo(() => orders.length > 0 ? (totalRevenue / orders.length).toFixed(0) : 0, [orders, totalRevenue]);
  const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'Delivered'), [orders]);
  const pendingOrders = useMemo(() => orders.filter(o => o.status !== 'Delivered'), [orders]);

  // Monthly breakdown
  const monthlyData = useMemo(() => {
    const data = {};
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!data[key]) data[key] = { orders: 0, revenue: 0 };
      data[key].orders++;
      data[key].revenue += o.totalAmount || 0;
    });
    return data;
  }, [orders]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const data = {};
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        const cat = item.category || 'Other';
        if (!data[cat]) data[cat] = { count: 0, revenue: 0 };
        data[cat].count++;
        data[cat].revenue += o.totalAmount || 0;
      });
    });
    return data;
  }, [orders]);

  // Payment method breakdown
  const paymentData = useMemo(() => {
    const data = {};
    orders.forEach(o => {
      const method = o.paymentMethod || 'Unknown';
      if (!data[method]) data[method] = 0;
      data[method]++;
    });
    return data;
  }, [orders]);

  if (loading) {
    return <div className="flex items-center justify-center p-12"><p className="text-muted-foreground">Loading reports...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Business analytics and performance overview.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><IndianRupee className="w-5 h-5 text-primary" /><span className="text-sm text-muted-foreground">Total Revenue</span></div>
          <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><ShoppingBag className="w-5 h-5 text-blue-400" /><span className="text-sm text-muted-foreground">Total Orders</span></div>
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><Users className="w-5 h-5 text-green-400" /><span className="text-sm text-muted-foreground">Total Customers</span></div>
          <p className="text-2xl font-bold text-foreground">{customers.length}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><TrendingUp className="w-5 h-5 text-purple-400" /><span className="text-sm text-muted-foreground">Avg. Order Value</span></div>
          <p className="text-2xl font-bold text-foreground">₹{avgOrderValue}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Breakdown */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Monthly Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Month</th>
                  <th className="px-6 py-3 font-medium">Orders</th>
                  <th className="px-6 py-3 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.entries(monthlyData).map(([month, data]) => (
                  <tr key={month} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-foreground">{month}</td>
                    <td className="px-6 py-3 text-foreground">{data.orders}</td>
                    <td className="px-6 py-3 text-foreground text-right font-medium">₹{data.revenue.toLocaleString()}</td>
                  </tr>
                ))}
                {Object.keys(monthlyData).length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Category Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Orders</th>
                  <th className="px-6 py-3 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.entries(categoryData).sort((a, b) => b[1].count - a[1].count).map(([cat, data]) => (
                  <tr key={cat} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-foreground">{cat}</td>
                    <td className="px-6 py-3 text-foreground">{data.count}</td>
                    <td className="px-6 py-3 text-foreground text-right font-medium">₹{data.revenue.toLocaleString()}</td>
                  </tr>
                ))}
                {Object.keys(categoryData).length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-primary" /> Order Status Summary</h3>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Order Received', color: 'bg-yellow-400' },
              { label: 'In Stitching', color: 'bg-blue-400' },
              { label: 'Quality Check', color: 'bg-purple-400' },
              { label: 'Ready for Delivery', color: 'bg-emerald-400' },
              { label: 'Delivered', color: 'bg-green-400' },
            ].map(status => {
              const count = orders.filter(o => o.status === status.label).length;
              const pct = orders.length > 0 ? (count / orders.length * 100).toFixed(0) : 0;
              return (
                <div key={status.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-foreground">{status.label}</span>
                    <span className="text-sm font-medium text-foreground">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className={`${status.color} h-2.5 rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><IndianRupee className="w-5 h-5 text-primary" /> Payment Methods</h3>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(paymentData).map(([method, count]) => {
              const pct = orders.length > 0 ? (count / orders.length * 100).toFixed(0) : 0;
              return (
                <div key={method}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-foreground capitalize">{method}</span>
                    <span className="text-sm font-medium text-foreground">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
            {Object.keys(paymentData).length === 0 && (
              <p className="text-center text-muted-foreground py-4">No payment data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
