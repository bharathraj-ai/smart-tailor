'use client';

import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  ArrowRight,
  Package,
  Scissors,
  Star
} from 'lucide-react';
import Link from 'next/link';

const stats = [
  { label: 'Total Orders', value: '12', icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Pending Orders', value: '2', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { label: 'Delivered', value: '10', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  { label: 'Saved Designs', value: '5', icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

const recentOrders = [
  { id: 'ORD-2023-001', product: 'Custom Silk Kurti', date: 'Oct 24, 2023', status: 'Stitching', statusColor: 'bg-orange-500/20 text-orange-600', amount: '$120.00' },
  { id: 'ORD-2023-002', product: 'Designer Blouse', date: 'Oct 15, 2023', status: 'Delivered', statusColor: 'bg-green-500/20 text-green-600', amount: '$85.00' },
  { id: 'ORD-2023-003', product: 'Men Tailored Suit', date: 'Sep 28, 2023', status: 'Delivered', statusColor: 'bg-green-500/20 text-green-600', amount: '$450.00' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function CustomerDashboard() {
  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Card */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-8 sm:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Hello Bharath 👋</h1>
          <p className="text-primary-foreground/80 text-lg mb-6">
            Ready for your next perfect fit? Explore new categories or track your current stitching orders.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/customer/categories" className="inline-flex items-center justify-center bg-white text-primary px-6 py-3 rounded-full font-semibold shadow-sm hover:shadow-md hover:bg-slate-50 transition-all">
              Start New Order <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link href="/customer/measurements" className="inline-flex items-center justify-center bg-primary-foreground/20 text-white backdrop-blur-sm px-6 py-3 rounded-full font-semibold hover:bg-primary-foreground/30 transition-all border border-white/10">
              View Measurements
            </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute right-40 bottom-0 w-40 h-40 bg-orange-300/20 rounded-full blur-2xl -mb-10 pointer-events-none" />
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
            <Link href="/customer/orders" className="text-sm text-primary font-medium hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{order.id}</td>
                    <td className="px-6 py-4 text-muted-foreground">{order.product}</td>
                    <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions / Notifications Summary */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/customer/categories/women" className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border text-center group">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Scissors className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Women</span>
              </Link>
              <Link href="/customer/categories/men" className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border text-center group">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Men</span>
              </Link>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
            <h3 className="text-lg font-semibold text-foreground mb-4">Latest Offer</h3>
            <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-lg border border-primary/20">
              <p className="text-primary font-bold text-lg mb-1">Get 20% Off!</p>
              <p className="text-sm text-muted-foreground mb-3">On your next custom tailoring order. Use code:</p>
              <div className="inline-block bg-background px-3 py-1.5 rounded text-foreground font-mono text-sm font-bold border border-border">
                SMART20
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
