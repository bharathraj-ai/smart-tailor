'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Ruler, 
  Package, 
  Grid, 
  Scissors, 
  CreditCard, 
  BarChart, 
  Star, 
  LogOut,
  Menu,
  X,
  Image as ImageIcon,
  Home
} from 'lucide-react';

const sidebarItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: Ruler, label: 'Measurements', href: '/admin/measurements' },
  { icon: Package, label: 'Products', href: '/admin/products' },
  { icon: Grid, label: 'Categories', href: '/admin/categories' },
  { icon: ImageIcon, label: 'Front Images', href: '/admin/front-images' },
  { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
  { icon: BarChart, label: 'Reports', href: '/admin/reports' },
  { icon: Star, label: 'Reviews', href: '/admin/reviews' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on path change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Determine active tab for bottom navigation
  const getActiveTab = () => {
    if (pathname === '/admin/dashboard') return 'dashboard';
    if (pathname?.startsWith('/admin/orders')) return 'orders';
    if (pathname?.startsWith('/admin/customers')) return 'customers';
    if (pathname?.startsWith('/admin/measurements')) return 'measurements';
    return '';
  };
  const activeTab = getActiveTab();

  const adminBottomTabs = [
    { id: 'home', label: 'Home', href: '/', icon: Home },
    { id: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', href: '/admin/customers', icon: Users },
    { id: 'measurements', label: 'Measurements', href: '/admin/measurements', icon: Ruler },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay (for drawer menu containing all 10 options) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-950 border-r border-border shadow-sm flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/admin/dashboard" className="text-xl font-bold text-primary flex items-center gap-2">
            <span>Ajay Tailor Admin</span>
          </Link>
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {sidebarItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative ${
                  isActive 
                    ? 'bg-primary text-primary-foreground font-medium shadow-sm' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'} />
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="adminActiveTab"
                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="mb-4 px-3 py-2 bg-secondary rounded-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Admin User</span>
              <span className="text-xs text-muted-foreground">Super Admin</span>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        {/* Mobile Header (simplified, logo + brand only) */}
        <header className="lg:hidden bg-slate-950 border-b border-border p-4 flex items-center justify-between sticky top-0 z-30">
          <span className="font-semibold text-foreground">Admin Panel</span>
          <Link href="/" className="text-primary font-bold text-sm flex items-center gap-1.5">
            <Scissors size={16} />
            <span> Ajay Tailor</span>
          </Link>
        </header>

        {/* Main Content Area - contains pb-20 on mobile to clear the bottom nav bar */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-muted/30 pb-20 lg:pb-8">
          {children}
        </main>

        {/* Admin Mobile Bottom Navigation Bar (WhatsApp/Material style) */}
        <nav className="lg:hidden fixed bottom-0 left-0 w-full h-16 bg-background border-t border-border z-40 flex items-center justify-around px-2 shadow-lg pb-safe">
          {adminBottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link 
                key={tab.id} 
                href={tab.href} 
                className={`flex flex-col items-center justify-center flex-1 h-full text-muted-foreground gap-1 transition-colors ${isActive ? 'text-primary' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <div className={`flex items-center justify-center px-4 py-1 rounded-full transition-colors ${isActive ? 'bg-primary/10 text-primary' : ''}`}>
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
          {/* Menu Drawer Toggle Button */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground gap-1 cursor-pointer"
          >
            <div className="flex items-center justify-center px-4 py-1 rounded-full text-muted-foreground">
              <Menu size={18} />
            </div>
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
