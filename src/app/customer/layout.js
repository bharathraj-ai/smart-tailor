'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Grid, 
  ShoppingBag, 
  Ruler, 
  Heart, 
  Bell, 
  MapPin, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/customer/dashboard' },
  { icon: Grid, label: 'Categories', href: '/customer/categories' },
  { icon: ShoppingBag, label: 'My Orders', href: '/customer/orders' },
  { icon: Ruler, label: 'Measurements', href: '/customer/measurements' },
  { icon: Heart, label: 'Saved Designs', href: '/customer/saved-designs' },
  { icon: Heart, label: 'Wishlist', href: '/customer/wishlist' }, // Note: Both use Heart in mockup, usually Wishlist is Heart
  { icon: Bell, label: 'Notifications', href: '/customer/notifications' },
  { icon: MapPin, label: 'Addresses', href: '/customer/addresses' },
  { icon: User, label: 'Profile', href: '/customer/profile' },
  { icon: Settings, label: 'Settings', href: '/customer/settings' },
];

export default function CustomerLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border shadow-sm flex flex-col transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/customer/dashboard" className="text-xl font-bold text-primary flex items-center gap-2">
            <span>Ajay Tailor</span>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-card border-b border-border p-4 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="text-foreground">
            <Menu size={24} />
          </button>
          <span className="font-semibold">Customer Portal</span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
