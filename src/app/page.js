import Link from 'next/link';
import { ArrowRight, Scissors, Ruler, Truck } from 'lucide-react';
import styles from './page.module.css';
import heroImg from '../images/images.jpg';

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Perfectly Fitted <span className={styles.textAccent}>Custom Clothing</span> Delivered to You.
            </h1>
            <p className={styles.heroSubtitle}>
              Experience the luxury of custom tailoring from the comfort of your home. Submit your measurements, choose your fabric, and let our expert tailors do the rest.
            </p>
            <div className={styles.heroActions}>
              <Link href="/categories" className="btn-primary">
                Explore Categories <ArrowRight size={20} style={{ marginLeft: '8px' }} />
              </Link>
              <Link href="/how-it-works" className="btn-secondary">
                How It Works
              </Link>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <div className={styles.heroImagePattern}></div>
            <div className={styles.heroImagePlaceholder}>
              <img 
                src={heroImg.src}
                alt="Tailor working on a suit" 
                className={styles.heroImage}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.featuresSection}`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why Choose SmartTailor?</h2>
          <div className={styles.featuresGrid}>
            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIconWrapper}>
                <Scissors className={styles.featureIcon} />
              </div>
              <h3 className={styles.featureTitle}>Expert Tailoring</h3>
              <p className={styles.featureText}>We partner with the best local tailors to ensure premium stitching and finish.</p>
            </div>
            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIconWrapper}>
                <Ruler className={styles.featureIcon} />
              </div>
              <h3 className={styles.featureTitle}>Perfect Fit</h3>
              <p className={styles.featureText}>Submit your measurements online and save them for future orders.</p>
            </div>
            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIconWrapper}>
                <Truck className={styles.featureIcon} />
              </div>
              <h3 className={styles.featureTitle}>Doorstep Delivery</h3>
              <p className={styles.featureText}>Get your stitched garments delivered home or pick them up from the store.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
