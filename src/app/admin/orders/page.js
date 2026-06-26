'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Eye, Clock, Package, CheckCircle, Search, Filter } from 'lucide-react';

const statusColors = {
  'Order Received': 'bg-yellow-500/20 text-yellow-400',
  'In Stitching': 'bg-blue-500/20 text-blue-400',
  'Quality Check': 'bg-purple-500/20 text-purple-400',
  'Ready for Delivery': 'bg-emerald-500/20 text-emerald-400',
  'Delivered': 'bg-green-500/20 text-green-400',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/tailor/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Order Received').length,
    inProgress: orders.filter(o => o.status === 'In Stitching' || o.status === 'Quality Check').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><p className="text-muted-foreground">Loading orders...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all customer orders.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><ShoppingBag className="w-5 h-5 text-primary" /><span className="text-sm text-muted-foreground">Total Orders</span></div>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><Clock className="w-5 h-5 text-yellow-400" /><span className="text-sm text-muted-foreground">Pending</span></div>
          <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><Package className="w-5 h-5 text-blue-400" /><span className="text-sm text-muted-foreground">In Progress</span></div>
          <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2"><CheckCircle className="w-5 h-5 text-green-400" /><span className="text-sm text-muted-foreground">Delivered</span></div>
          <p className="text-2xl font-bold text-foreground">{stats.delivered}</p>
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
          <option value="all">All Status</option>
          <option value="Order Received">Order Received</option>
          <option value="In Stitching">In Stitching</option>
          <option value="Quality Check">Quality Check</option>
          <option value="Ready for Delivery">Ready for Delivery</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-foreground">{order.user?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {order.items?.map(i => i.category).join(', ') || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground capitalize">{order.paymentMethod}</td>
                  <td className="px-6 py-4 font-medium text-foreground text-right">₹{order.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No orders found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
