import Link from 'next/link';
import { Scissors, Mail, Phone, MapPin } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          {/* Brand */}
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.footerLogo}>
              <Scissors className={styles.footerLogoIcon} />
              <span>SmartTailor</span>
            </Link>
            <p className={styles.footerDesc}>
              Experience the luxury of custom tailoring from the comfort of your home. Premium fabrics, expert craftsmanship, perfect fit — every time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={styles.footerHeading}>Quick Links</h4>
            <ul className={styles.footerLinks}>
              <li><Link href="/categories" className={styles.footerLink}>Categories</Link></li>
              <li><Link href="/measurements" className={styles.footerLink}>Measurements</Link></li>
              <li><Link href="/contact" className={styles.footerLink}>Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className={styles.footerHeading}>Services</h4>
            <ul className={styles.footerLinks}>
              <li><Link href="/categories" className={styles.footerLink}>Custom Shirts</Link></li>
              <li><Link href="/categories" className={styles.footerLink}>Suits & Blazers</Link></li>
              <li><Link href="/categories" className={styles.footerLink}>Traditional Wear</Link></li>
              <li><Link href="/categories" className={styles.footerLink}>Alterations</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className={styles.footerHeading}>Contact</h4>
            <div className={styles.footerContactItem}>
              <MapPin size={16} className={styles.footerContactIcon} />
              <span>123 Tailor Street, Fashion City</span>
            </div>
            <div className={styles.footerContactItem}>
              <Phone size={16} className={styles.footerContactIcon} />
              <span>+91 98765 43210</span>
            </div>
            <div className={styles.footerContactItem}>
              <Mail size={16} className={styles.footerContactIcon} />
              <span>hello@smarttailor.com</span>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.footerCopy}>&copy; {new Date().getFullYear()} SmartTailor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
