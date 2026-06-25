'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Scissors, ShoppingBag, User, LogOut } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className={`${styles.header} glass`}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <Scissors className={styles.logoIcon} />
          <span>SmartTailor</span>
        </Link>
        
        <nav className={styles.navLinks}>
          <Link href="/categories" className={styles.navLink}>Categories</Link>
          <Link href="/measurements" className={styles.navLink}>Measurements</Link>
        </nav>

        <div className={styles.navActions}>
          <Link href="/cart" className={styles.iconBtn}>
            <ShoppingBag size={20} />
          </Link>
          {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/profile" className={styles.iconBtn}>
                <User size={20} />
              </Link>
              <button onClick={() => signOut()} className={styles.iconBtn} title="Sign Out">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Sign In</Link>
          )}
        </div>
      </div>
    </header>
  );
}
