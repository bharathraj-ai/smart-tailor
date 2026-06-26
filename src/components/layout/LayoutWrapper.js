'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

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
