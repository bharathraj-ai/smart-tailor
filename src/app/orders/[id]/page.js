import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import styles from './order.module.css';
import { Package, Scissors, CheckCircle, Truck, Store } from 'lucide-react';
import Link from 'next/link';
import { getDb } from '@/lib/db';


export default async function OrderDetailsPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const { id } = resolvedParams;

  const db = await getDb();
  let order;

  if (id === 'latest') {
    const { data: user } = await db
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (user) {
      const { data: latestOrder } = await db
        .from('orders')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false })
        .limit(1)
        .maybeSingle();

      order = latestOrder;
    }
  } else {
    try {
      const { data: foundOrder } = await db
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      order = foundOrder;
    } catch {
      order = null;
    }
  }

  if (order) {
    // Get items for the order
    const { data: itemsData } = await db
      .from('orderItems')
      .select('*')
      .eq('orderId', order.id);

    order.items = itemsData || [];
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h1>Order not found</h1>
        <Link href="/profile" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>Back to Profile</Link>
      </div>
    );
  }

  const steps = [
    { label: 'Order Received', icon: Package, statuses: ['Order Received', 'Order Confirmed'] },
    { label: 'In Stitching', icon: Scissors, statuses: ['In Stitching', 'Quality Check'] },
    { label: 'Ready for Delivery', icon: CheckCircle, statuses: ['Ready for Delivery'] },
    { label: order.deliveryType === 'Pickup' ? 'Picked Up' : 'Delivered', icon: order.deliveryType === 'Pickup' ? Store : Truck, statuses: ['Delivered'] }
  ];

  const currentStepIndex = steps.findIndex(s => s.statuses.includes(order.status));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Order Details</h1>
        <p className={styles.orderId}>ID: {order.id}</p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Status Timeline</h2>
        <div className={styles.timeline}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            // Treat anything after current step index as not completed yet
            // If currentStepIndex is -1, it means status doesn't match standard flow
            const isCompleted = currentStepIndex >= index;
            const isCurrent = currentStepIndex === index;

            return (
              <div key={index} className={`${styles.step} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}>
                <div className={styles.stepIconWrapper}>
                  <Icon size={24} className={styles.stepIcon} />
                </div>
                <div className={styles.stepLabel}>{step.label}</div>
                {index < steps.length - 1 && <div className={styles.connector} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Items</h2>
          <div className={styles.itemList}>
            {order.items.map(item => (
              <div key={item.id} className={styles.item}>
                <span className={styles.itemName}>{item.category}</span>
              </div>
            ))}
            {order.items.length === 0 && (
              <div className={styles.item}>
                <span className={styles.itemName}>No items recorded.</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Summary</h2>
          <div className={styles.summaryRow}>
            <span>Payment Method</span>
            <span>{order.paymentMethod}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Payment Status</span>
            <span>{order.paymentStatus}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Delivery Type</span>
            <span>{order.deliveryType}</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>Total Amount</span>
            <span className={styles.accent}>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
