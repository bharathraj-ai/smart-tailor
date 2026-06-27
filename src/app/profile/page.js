import { User, Mail, Phone, MapPin, Ruler, Package, Edit2 } from 'lucide-react';
import styles from './profile.module.css';
import Link from 'next/link';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';


export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/login');
  }

  const db = await getDb();

  const { data: dbUser } = await db
    .from('users')
    .select('*')
    .eq('email', session.user.email)
    .single();

  if (!dbUser) {
    redirect('/login');
  }

  const userId = dbUser.id;

  // Get measurements
  const { data: measurementsData } = await db
    .from('measurements')
    .select('*')
    .eq('userId', userId);
  const measurements = measurementsData || [];

  // Get orders
  const { data: ordersData } = await db
    .from('orders')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });
  const orders = ordersData || [];

  // Batch fetch all order items in a single query instead of N+1 loop
  let orderItemsMap = {};
  if (orders.length > 0) {
    const orderIds = orders.map(o => o.id);
    const { data: allItems } = await db
      .from('orderItems')
      .select('*')
      .in('orderId', orderIds);
    
    // Group items by orderId
    for (const item of (allItems || [])) {
      if (!orderItemsMap[item.orderId]) {
        orderItemsMap[item.orderId] = [];
      }
      orderItemsMap[item.orderId].push(item);
    }
  }

  // Attach items to orders
  for (const order of orders) {
    order.items = orderItemsMap[order.id] || [];
  }

  const user = {
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
    address: dbUser.address || "No address provided",
    measurements: measurements.map(m => ({
      name: m.name,
      date: new Date(m.createdAt).toLocaleDateString()
    })),
    orders: orders.map(o => ({
      id: "ORD-" + o.id.substring(0, 4).toUpperCase(),
      originalId: o.id,
      item: o.items[0]?.category || "Custom Item",
      date: new Date(o.createdAt).toLocaleDateString(),
      status: o.status,
      amount: `₹${o.totalAmount}`
    }))
  };
  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>
        <p className={styles.subtitle}>Manage your account, measurements, and track orders.</p>
      </div>

      <div className={styles.grid}>
        {/* Left Column - User Info & Measurements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          <div className={styles.card}>
            <div className={styles.avatar}>
              {user.name.charAt(0)}
            </div>
            <h2 className={styles.sectionTitle} style={{ justifyContent: 'center' }}>{user.name}</h2>
            
            <div className={styles.userInfo}>
              <div className={styles.infoItem}>
                <Mail size={18} />
                <div>
                  <div className={styles.infoLabel}>Email</div>
                  <div className={styles.infoValue}>{user.email}</div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <Phone size={18} />
                <div>
                  <div className={styles.infoLabel}>Phone</div>
                  <div className={styles.infoValue}>{user.phone}</div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <MapPin size={18} />
                <div>
                  <div className={styles.infoLabel}>Delivery Address</div>
                  <div className={styles.infoValue}>{user.address}</div>
                </div>
              </div>
            </div>
            
            <button className="btn-secondary" style={{ width: '100%', marginTop: '2rem' }}>
              <Edit2 size={16} style={{ marginRight: '8px' }} /> Edit Profile
            </button>
          </div>

          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>
              <Ruler size={24} /> Saved Measurements
            </h2>
            <div className={styles.measurementList}>
              {user.measurements.map((m, i) => (
                <div key={i} className={styles.measurementItem}>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Updated {m.date}</div>
                  </div>
                  <button className="btn-secondary" style={{ padding: '0.5rem' }}>
                    <Edit2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
              + Add New Profile
            </button>
          </div>
          
        </div>

        {/* Right Column - Orders */}
        <div>
          <div className={styles.card} style={{ height: '100%' }}>
            <h2 className={styles.sectionTitle}>
              <Package size={24} /> Recent Orders
            </h2>
            <div className={styles.orderList}>
              {user.orders.map((order, i) => (
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
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button className="btn-secondary">View All Orders</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
