'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, PhoneCall, Check, Clock, Package, CheckCircle, X } from 'lucide-react';
import styles from './dashboard.module.css';
import { cachedFetch, invalidateCache } from '@/lib/apiCache';

const statuses = ['Order Received', 'In Stitching', 'Quality Check', 'Ready for Delivery', 'Delivered'];

export default function TailorDashboard() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setLightboxImage(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Cached for 2 minutes. Invalidated automatically on status update.
      const data = await cachedFetch('/api/tailor/orders', {}, 120);
      const formattedOrders = data.orders.map(o => ({
        id: o.id,
        displayId: "ORD-" + o.id.substring(0, 4).toUpperCase(),
        customer: o.user.name,
        phone: o.user.phone,
        item: o.items[0]?.category || "Custom Item",
        date: new Date(o.createdAt).toLocaleDateString(),
        status: o.status,
        payment: o.paymentMethod,
        amount: `₹${o.totalAmount}`,
        items: o.items,
      }));
      setOrders(formattedOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    // Optimistic update
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        invalidateCache('/api/tailor/orders'); // Clear stale cache after mutation.
        alert(`Status updated to ${newStatus}. Saved to database.`);
      } else {
        fetchOrders();
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      fetchOrders();
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Order Received': return <Clock size={16} />;
      case 'In Stitching': return <Package size={16} />;
      case 'Ready for Delivery': return <CheckCircle size={16} />;
      case 'Delivered': return <Check size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (isLoading) {
    return <div className={`container ${styles.dashboardContainer}`} style={{ textAlign: 'center', padding: '4rem' }}>Loading Orders...</div>;
  }

  return (
    <div className={`container ${styles.dashboardContainer}`}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className={styles.title}>Tailor Dashboard</h1>
          <p className={styles.subtitle}>Manage your stitching workflow and active orders.</p>
        </div>
        <Link href="/admin/categories" className="btn-primary">
          Manage Categories
        </Link>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.orderList}>
          <h2 className={styles.sectionTitle}>Active Orders</h2>
          <div className={styles.cards}>
            {orders.map((order) => (
              <div key={order.id} className={`card ${styles.orderCard} ${selectedOrder?.id === order.id ? styles.selectedCard : ''}`} onClick={() => { setSelectedOrder(order); setShowMeasurements(false); }}>
                <div className={styles.cardHeader}>
                  <span className={styles.orderId}>{order.displayId}</span>
                  <span className={`${styles.statusBadge} ${styles[order.status.replace(/ /g, '')]}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.customerName}>{order.customer}</h3>
                  <p className={styles.orderItem}>{order.item}</p>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.orderDate}>{order.date}</span>
                  <span className={styles.orderAmount}>{order.amount}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No orders found.</p>}
          </div>
        </div>

        <div className={styles.orderDetails}>
          {selectedOrder ? (
            <div className={styles.orderDetailsCard}>
              <h2 className={styles.sectionTitle}>Order Details</h2>
              <div className={styles.detailSection}>
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {selectedOrder.customer}</p>
                <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                <button className="btn-secondary" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
                  <PhoneCall size={16} style={{ marginRight: '8px' }} /> Call Customer
                </button>
              </div>

              <div className={styles.detailSection}>
                <h3>Measurements</h3>
                {!showMeasurements ? (
                  <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => setShowMeasurements(true)}>
                    <Eye size={16} style={{ marginRight: '8px' }} /> View Full Measurements
                  </button>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} style={{ marginBottom: '1rem' }}>
                        <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>{item.category}</h4>
                        {item.measurement ? (
                          <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                              {item.measurement.chest && <div><strong>Chest:</strong> {item.measurement.chest}"</div>}
                              {item.measurement.waist && <div><strong>Waist:</strong> {item.measurement.waist}"</div>}
                              {item.measurement.hip && <div><strong>Hip:</strong> {item.measurement.hip}"</div>}
                              {item.measurement.shoulder && <div><strong>Shoulder:</strong> {item.measurement.shoulder}"</div>}
                              {item.measurement.sleeveLength && <div><strong>Sleeve:</strong> {item.measurement.sleeveLength}"</div>}
                              {item.measurement.neckSize && <div><strong>Neck:</strong> {item.measurement.neckSize}"</div>}
                              {item.measurement.height && <div><strong>Height:</strong> {item.measurement.height}"</div>}
                            </div>
                            {item.measurement.customNotes && (() => {
                              const parts = item.measurement.customNotes.split('|||');
                              const noteText = parts[0];
                              const imageBase64 = parts[1];
                              return (
                                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                  {noteText && <div><strong>Notes:</strong> {noteText}</div>}
                                  {imageBase64 && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                      <strong>Reference Image:</strong>
                                      <div style={{ marginTop: '0.25rem' }}>
                                        <img src={imageBase64} alt="Reference design" onClick={() => setLightboxImage(imageBase64)} style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'} />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </>
                        ) : (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No specific measurements provided for this item.</p>
                        )}
                      </div>
                    ))}
                    <button className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', marginTop: '0.5rem' }} onClick={() => setShowMeasurements(false)}>
                      Hide Measurements
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.detailSection}>
                <h3>Update Status</h3>
                <div className={styles.statusUpdater}>
                  <select 
                    className={styles.statusSelect} 
                    value={selectedOrder.status}
                    onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <p className={styles.helperText}><PhoneCall size={14} /> Updating status will save to database and notify customer.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Package size={48} className={styles.emptyStateIcon} />
              <p className={styles.emptyStateText}>Select an order to view details and update workflow.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Popup */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <button
            onClick={() => setLightboxImage(null)}
            aria-label="Close image preview"
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <X size={24} />
          </button>
          <img
            src={lightboxImage}
            alt="Reference design full view"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      )}
    </div>
  );
}
