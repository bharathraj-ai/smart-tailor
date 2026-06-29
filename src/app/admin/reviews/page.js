'use client';

import { useState, useEffect, useMemo } from 'react';
import { Star, MessageSquare, ThumbsUp, Search } from 'lucide-react';
import { cachedFetch } from '@/lib/apiCache';

export default function AdminReviewsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  const fetchDeliveredOrders = async () => {
    try {
      const data = await cachedFetch('/api/tailor/orders', {}, 120);
      const delivered = (data.orders || []).filter(o => o.status === 'Delivered');
      setOrders(delivered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => orders.filter(o =>
    o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.items?.[0]?.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [orders, searchTerm]);

  if (loading) {
    return <div className="flex items-center justify-center p-12"><p className="text-muted-foreground">Loading reviews...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">Customer feedback from delivered orders.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><MessageSquare className="w-5 h-5 text-primary" /><span className="text-sm text-muted-foreground">Delivered Orders</span></div>
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><ThumbsUp className="w-5 h-5 text-green-400" /><span className="text-sm text-muted-foreground">Completed Successfully</span></div>
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><Star className="w-5 h-5 text-yellow-400" /><span className="text-sm text-muted-foreground">Awaiting Review</span></div>
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by customer or item..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Delivered Orders List */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Item</th>
                <th className="px-6 py-4 font-medium">Delivered On</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {order.user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-foreground">{order.user?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{order.items?.map(i => i.category).join(', ') || 'N/A'}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(order.updatedAt || order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground text-right">₹{order.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No delivered orders found yet. Reviews will appear here when orders are delivered.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
