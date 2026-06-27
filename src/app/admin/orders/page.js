'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Clock, Package, CheckCircle, Search } from 'lucide-react';
import { cachedFetch, invalidateCache } from '@/lib/apiCache';

const statusColors = {
  'Order Received': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Order Confirmed': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'In Stitching': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Quality Check': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Ready for Delivery': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Delivered': 'bg-green-500/20 text-green-400 border-green-500/30',
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
      // Cached for 2 minutes — invalidated automatically on status change.
      const data = await cachedFetch('/api/tailor/orders', {}, 120);
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        // Invalidate so the next load fetches fresh data from DB.
        invalidateCache('/api/tailor/orders');
        setOrders(prevOrders => 
          prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        );
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
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
    pending: orders.filter(o => o.status === 'Order Received' || o.status === 'Order Confirmed').length,
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

      {/* Stats Cards */}
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

      {/* Filters bar */}
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
          className="self-start w-auto min-w-[150px] px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="Order Received">Order Received</option>
          <option value="Order Confirmed">Order Confirmed</option>
          <option value="In Stitching">In Stitching</option>
          <option value="Quality Check">Quality Check</option>
          <option value="Ready for Delivery">Ready for Delivery</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {/* Orders Grid Box View */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-card border border-border p-5 rounded-xl flex flex-col justify-between">
            <div>
              {/* Card Header (Customer Avatar, Name, ID) */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {order.user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{order.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">#ORD-{order.id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>

              {/* Order Info Fields */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm border-t border-border pt-4">
                <div>
                  <span className="text-muted-foreground block text-xs">Items</span>
                  <span className="text-foreground font-medium block truncate" title={order.items?.map(i => i.category).join(', ')}>
                    {order.items?.map(i => i.category).join(', ') || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Date</span>
                  <span className="text-foreground font-medium block">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Payment Method</span>
                  <span className="text-foreground font-medium block capitalize">
                    {order.paymentMethod}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Amount</span>
                  <span className="text-primary font-bold block">
                    ₹{order.totalAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Footer (Status Update Dropdown) */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Status:</span>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-semibold outline-none border border-border/50 cursor-pointer bg-no-repeat ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3e%3c/path%3e%3c/svg%3e")`, 
                  backgroundPosition: 'right 10px center', 
                  backgroundSize: '12px' 
                }}
              >
                <option value="Order Received" className="bg-card text-foreground">Order Received</option>
                <option value="Order Confirmed" className="bg-card text-foreground">Order Confirmed</option>
                <option value="In Stitching" className="bg-card text-foreground">In Stitching</option>
                <option value="Quality Check" className="bg-card text-foreground">Quality Check</option>
                <option value="Ready for Delivery" className="bg-card text-foreground">Ready for Delivery</option>
                <option value="Delivered" className="bg-card text-foreground">Delivered</option>
              </select>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">No orders found.</div>
        )}
      </div>
    </div>
  );
}
