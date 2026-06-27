'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  if (isAdminPage) {
    return (
      <>
        <Navbar />
        <div style={{ paddingTop: 'var(--nav-height)' }}>
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-height)', minHeight: 'calc(100vh - var(--nav-height))' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
