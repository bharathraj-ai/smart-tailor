'use client';

import { useState } from 'react';
import { Eye, PhoneCall, Check, Clock, Package, CheckCircle } from 'lucide-react';
import styles from './dashboard.module.css';

// Mock data
const mockOrders = [
  {
    id: 'ORD-7291',
    customer: 'Rahul Sharma',
    phone: 'numberxxxxxxx',
    item: 'Custom Shirt (Cotton)',
    date: 'Oct 24, 2026',
    status: 'Order Received',
    payment: 'Cash on Delivery',
    amount: '₹1,299'
  },
  {
    id: 'ORD-7288',
    customer: 'Priya Patel',
    phone: 'numberxxxxxxx',
    item: 'Designer Blouse',
    date: 'Oct 23, 2026',
    status: 'In Stitching',
    payment: 'Razorpay',
    amount: '₹2,499'
  },
  {
    id: 'ORD-7285',
    customer: 'Amit Kumar',
    phone: 'numberxxxxxxx',
    item: 'Men\'s Suit (Wool)',
    date: 'Oct 20, 2026',
    status: 'Ready for Delivery',
    payment: 'Razorpay',
    amount: '₹8,999'
  }
];

const statuses = ['Order Received', 'In Stitching', 'Quality Check', 'Ready for Delivery', 'Delivered'];

export default function TailorDashboard() {
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const updateStatus = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    // Simulate API call to notify via phone call
    alert(`Status updated to ${newStatus}. Initiating automated phone call to ${orders.find(o=>o.id===id).phone}...`);
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

  return (
    <div className={`container ${styles.dashboardContainer}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tailor Dashboard</h1>
        <p className={styles.subtitle}>Manage your stitching workflow and active orders.</p>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.orderList}>
          <h2 className={styles.sectionTitle}>Active Orders</h2>
          <div className={styles.cards}>
            {orders.map((order) => (
              <div key={order.id} className={`card ${styles.orderCard} ${selectedOrder?.id === order.id ? styles.selectedCard : ''}`} onClick={() => setSelectedOrder(order)}>
                <div className={styles.cardHeader}>
                  <span className={styles.orderId}>{order.id}</span>
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
                <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  <Eye size={16} style={{ marginRight: '8px' }} /> View Full Measurements
                </button>
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
                  <p className={styles.helperText}><PhoneCall size={14} /> Updating status will trigger an automated phone call to the customer.</p>
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
    </div>
  );
}
