'use client';

import { useState, useEffect, useMemo } from 'react';
import { Truck, MapPin, CheckCircle, Search, Phone } from 'lucide-react';
import { cachedFetch, invalidateCache } from '@/lib/apiCache';

export default function AdminDeliveriesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await cachedFetch('/api/tailor/orders', {}, 120);
      // Only show Home Delivery orders with "Ready for Delivery" status
      const deliveryOrders = (data.orders || []).filter(o =>
        o.deliveryType === 'Home Delivery' &&
        o.status === 'Ready for Delivery'
      );
      setOrders(deliveryOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Delivered' })
      });

      if (res.ok) {
        invalidateCache('/api/tailor/orders');
        // Remove from list since it's no longer "Ready for Delivery"
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  const filteredOrders = useMemo(() => orders.filter(order => {
    return (
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }), [orders, searchTerm]);

  if (loading) {
    return <div className="flex items-center justify-center p-12"><p className="text-muted-foreground">Loading deliveries...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Delivery Addresses</h1>
        <p className="text-sm text-muted-foreground mt-1">Orders ready for home delivery — {orders.length} pending</p>
      </div>

      {/* Search */}
      {orders.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, order ID, or address..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {/* Delivery Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
            {/* Status Banner */}
            <div className="px-4 py-2 text-xs font-semibold flex items-center gap-2 bg-emerald-500/10 text-emerald-600">
              <Truck size={14} />
              Ready for Delivery
            </div>

            <div className="p-5 flex-1 flex flex-col">
              {/* Customer Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {order.user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{order.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">#ORD-{order.id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>

              {/* Delivery Address — the main focus of this page */}
              <div className="bg-muted/50 border border-border/50 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground font-medium block mb-1">Delivery Address</span>
                    <p className="text-sm text-foreground leading-relaxed">
                      {order.deliveryAddress || 'No address provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Phone */}
              {order.user?.phone && (
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <Phone size={14} className="text-muted-foreground" />
                  <a href={`tel:${order.user.phone}`} className="text-foreground hover:text-primary transition-colors">
                    {order.user.phone}
                  </a>
                </div>
              )}

              {/* Order Details */}
              <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-sm border-t border-border pt-3 mt-auto">
                <div>
                  <span className="text-muted-foreground block text-xs">Items</span>
                  <span className="text-foreground font-medium block truncate" title={order.items?.map(i => i.category).join(', ')}>
                    {order.items?.map(i => i.category).join(', ') || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Amount</span>
                  <span className="text-primary font-bold block">₹{order.totalAmount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Payment</span>
                  <span className="text-foreground font-medium block capitalize">{order.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Ordered</span>
                  <span className="text-foreground font-medium block">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Mark Delivered Button */}
            <div className="px-5 pb-5">
              <button
                onClick={() => handleMarkDelivered(order.id)}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                Mark as Delivered
              </button>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Truck size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No orders ready for delivery</p>
            <p className="text-xs mt-1">Orders will appear here when their status is set to &quot;Ready for Delivery&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
