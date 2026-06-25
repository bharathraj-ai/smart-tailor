import { User, Mail, Phone, MapPin, Ruler, Package, Edit2 } from 'lucide-react';
import styles from './profile.module.css';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      measurements: true,
      orders: {
        include: { items: true }
      }
    }
  });

  if (!dbUser) {
    redirect('/login');
  }

  const user = {
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
    address: dbUser.address || "No address provided",
    measurements: dbUser.measurements.map(m => ({
      name: m.name,
      date: m.createdAt.toLocaleDateString()
    })),
    orders: dbUser.orders.map(o => ({
      id: "ORD-" + o.id.substring(0, 4).toUpperCase(),
      item: o.items[0]?.category || "Custom Item",
      date: o.createdAt.toLocaleDateString(),
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
                    <div style={{ fontWeight: 500, color: '#fff' }}>{m.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Updated {m.date}</div>
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
                <div key={i} className={styles.orderCard}>
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
