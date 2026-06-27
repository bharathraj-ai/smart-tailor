'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Search, IndianRupee, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cachedFetch } from '@/lib/apiCache';

const paymentStatusColors = {
  'Pending': 'bg-yellow-500/20 text-yellow-400',
  'Paid': 'bg-green-500/20 text-green-400',
  'Failed': 'bg-red-500/20 text-red-400',
  'Refunded': 'bg-purple-500/20 text-purple-400',
};

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Uses shared cache key — already warm if orders page was visited.
      const data = await cachedFetch('/api/tailor/orders', {}, 120);
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(order => {
    const matchesSearch = order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.paymentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const paidOrders = orders.filter(o => o.paymentStatus === 'Paid');
  const pendingOrders = orders.filter(o => o.paymentStatus === 'Pending');

  if (loading) {
    return <div className="flex items-center justify-center p-12"><p className="text-muted-foreground">Loading payments...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">Track all order payments and transactions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><IndianRupee className="w-5 h-5 text-primary" /><span className="text-sm text-muted-foreground">Total Revenue</span></div>
          <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><CreditCard className="w-5 h-5 text-blue-400" /><span className="text-sm text-muted-foreground">Total Transactions</span></div>
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><CheckCircle className="w-5 h-5 text-green-400" /><span className="text-sm text-muted-foreground">Paid</span></div>
          <p className="text-2xl font-bold text-foreground">{paidOrders.length}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><Clock className="w-5 h-5 text-yellow-400" /><span className="text-sm text-muted-foreground">Pending</span></div>
          <p className="text-2xl font-bold text-foreground">{pendingOrders.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer name or order ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">All Payment Status</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Payment Status</th>
                <th className="px-6 py-4 font-medium">Order Status</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">#{order.id.substring(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4 text-foreground">{order.user?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-foreground capitalize">{order.paymentMethod}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${paymentStatusColors[order.paymentStatus] || 'bg-gray-500/20 text-gray-400'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{order.status}</td>
                  <td className="px-6 py-4 font-bold text-foreground text-right">₹{order.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No payments found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
