import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import Link from 'next/link';
import styles from './orders.module.css';
import { Package, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

const statusClasses = {
  'Order Received': styles.statusReceived,
  'Order Confirmed': styles.statusReceived,
  'In Stitching': styles.statusStitching,
  'Quality Check': styles.statusQualityCheck,
  'Ready for Delivery': styles.statusReady,
  'Delivered': styles.statusDelivered,
};

export default async function CustomerOrdersPage() {
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

  // Fetch all orders for this user
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

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Orders</h1>
        <p className={styles.subtitle}>Track the status and progress of your custom garments.</p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
          <h3 className={styles.emptyTitle}>No Orders Found</h3>
          <p className={styles.emptyText}>You haven't placed any custom tailoring orders yet.</p>
          <Link href="/categories" className="btn-primary">Start Customizing</Link>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => {
            const date = new Date(order.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            const mainItem = order.items?.[0]?.category || 'Custom Entry';
            
            return (
              <Link href={`/orders/${order.id}`} key={order.id} className={styles.orderCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.orderId}>
                    #ORD-{order.id.substring(0, 8).toUpperCase()}
                  </span>
                  <span className={`${styles.statusBadge} ${statusClasses[order.status] || ''}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemLabel}>Garment / Items</div>
                    <div className={styles.itemName}>{mainItem}</div>
                    {order.items.length > 1 && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        + {order.items.length - 1} more item(s)
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className={styles.metaLabel}>Order Date</div>
                    <div className={styles.metaValue}>{date}</div>
                  </div>
                  
                  <div>
                    <div className={styles.metaLabel}>Total Price</div>
                    <div className={`${styles.metaValue} ${styles.metaAmount}`}>₹{order.totalAmount}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}>
                    <ShieldCheck size={16} style={{ color: 'var(--accent)' }} />
                    <span>Payment status: <strong>{order.paymentStatus}</strong> via {order.paymentMethod}</span>
                  </div>
                  <span className={styles.viewDetails}>
                    Track Progress <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
