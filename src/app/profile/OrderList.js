'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './profile.module.css';

export default function OrderList({ orders }) {
  const [showAll, setShowAll] = useState(false);
  
  const displayedOrders = showAll ? orders : orders.slice(0, 5);

  return (
    <>
      <div className={styles.orderList}>
        {displayedOrders.map((order, i) => (
          <Link href={`/orders/${order.originalId}`} key={i} style={{ textDecoration: 'none' }}>
            <div className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.orderId}>{order.id}</span>
                <span className={`${styles.statusBadge} ${styles['status-' + order.status.replace(/ /g, '')] || ''}`}>
                  {order.status}
                </span>
              </div>
              <div className={styles.orderDetails}>
                <div>
                  <div className={styles.orderItem}>{order.item}</div>
                  <div className={styles.orderDate}>{order.date}</div>
                </div>
                <div className={styles.orderAmount}>{order.amount}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {orders.length > 5 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            className="btn-secondary" 
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : 'View All Orders'}
          </button>
        </div>
      )}
    </>
  );
}
