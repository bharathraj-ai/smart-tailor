import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import styles from './order.module.css';
import { Package, Scissors, CheckCircle, Truck, Store } from 'lucide-react';
import Link from 'next/link';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default async function OrderDetailsPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const { id } = resolvedParams;

  let order;
  if (id === 'latest') {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user) {
      order = await prisma.order.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      });
    }
  } else {
    order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });
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
    { label: 'Order Received', icon: Package, status: 'Order Received' },
    { label: 'In Stitching', icon: Scissors, status: 'In Stitching' },
    { label: 'Ready for Delivery', icon: CheckCircle, status: 'Ready for Delivery' },
    { label: order.deliveryType === 'Pickup' ? 'Picked Up' : 'Delivered', icon: order.deliveryType === 'Pickup' ? Store : Truck, status: 'Delivered' }
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.status);

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
