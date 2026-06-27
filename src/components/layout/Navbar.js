'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Scissors, User, LogOut, Home, Grid, Phone, Package, LayoutDashboard, LogIn } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdminPage = pathname?.startsWith('/admin');

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = (
    <>
      <Link href="/categories" className={styles.navLink}>Categories</Link>
      <Link href="/contact" className={styles.navLink}>Contact</Link>
      {session && session.user.role !== 'tailor' && (
        <Link href="/orders" className={styles.navLink}>My Orders</Link>
      )}
      {session?.user?.role === 'tailor' && (
        <Link href="/admin/dashboard" className={styles.navLink}>Admin</Link>
      )}
    </>
  );

  // Define tabs for bottom navigation bar on mobile
  const getActiveTab = () => {
    if (pathname === '/') return 'home';
    if (pathname?.startsWith('/categories')) return 'categories';
    if (pathname?.startsWith('/contact')) return 'contact';
    if (pathname?.startsWith('/orders')) return 'orders';
    if (pathname?.startsWith('/admin')) return 'admin';
    if (pathname?.startsWith('/profile') || pathname?.startsWith('/login') || pathname?.startsWith('/signup')) return 'profile';
    return '';
  };

  const activeTab = getActiveTab();

  const bottomTabs = [
    { id: 'home', label: 'Home', href: '/', icon: Home },
    { id: 'categories', label: 'Categories', href: '/categories', icon: Grid },
    // Show orders if customer, show admin if tailor
    ...(session ? [
      session.user.role === 'tailor'
        ? { id: 'admin', label: 'Admin', href: '/admin/dashboard', icon: LayoutDashboard }
        : { id: 'orders', label: 'Orders', href: '/orders', icon: Package }
    ] : []),
    { id: 'contact', label: 'Contact', href: '/contact', icon: Phone },
    { 
      id: 'profile', 
      label: session ? 'Profile' : 'Sign In', 
      href: session ? '/profile' : '/login', 
      icon: session ? User : LogIn 
    }
  ];

  return (
    <>
      <header className={`${styles.header} glass`}>
        <div className={`container ${styles.navContainer}`}>
          <Link href="/" className={styles.logo}>
            <Scissors className={styles.logoIcon} />
            <span>SmartTailor</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className={styles.navLinks}>
            {navLinks}
          </nav>

          <div className={styles.navActions}>
            {session ? (
              <div className={styles.authActions}>
                <Link href="/profile" className={styles.iconBtn}>
                  <User size={20} />
                </Link>
                <button onClick={() => signOut()} className={styles.iconBtn} title="Sign Out">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link href="/login" className={`btn-primary ${styles.signInBtn}`}>Sign In</Link>
            )}

            {/* Mobile-only Sign Out (only if logged in and not on admin pages) */}
            {session && !isAdminPage && (
              <button 
                onClick={() => signOut()} 
                className={styles.mobileSignOut} 
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (hidden on admin pages) */}
      {!isAdminPage && (
        <nav className={`${styles.bottomNav} glass`}>
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link 
                key={tab.id} 
                href={tab.href} 
                className={`${styles.bottomTab} ${isActive ? styles.bottomTabActive : ''}`}
              >
                <div className={styles.iconWrapper}>
                  <Icon size={20} />
                </div>
                <span className={styles.tabLabel}>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
