import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Scissors, Ruler, Truck, Star, Shield, Clock, ChevronRight } from 'lucide-react';
import styles from './page.module.css';
import { getDb } from '@/lib/db';

// Force dynamic rendering - DB not available at build time
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch hero images from database
  const db = await getDb();
  const { data: settings } = await db
    .from('siteSettings')
    .select('*')
    .eq('key', 'heroImages')
    .single();
  const heroImages = settings?.images || [];
  // Build the preload URL for the hero image (helps browser start downloading immediately)
  const heroImageUrl = heroImages.length > 0 ? `/api/images/${heroImages[0].imageId}` : null;

  return (
    <>
      {/* Preload hero image to reduce LCP */}
      {heroImageUrl && (
        <link rel="preload" href={heroImageUrl} as="image" fetchPriority="high" />
      )}
      <div className={styles.page}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBgGlow}></div>
          <div className={`container ${styles.heroContainer}`}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>
                <Star size={14} /> Trusted by 1000+ Customers
              </div>
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
                <Link href="/contact" className="btn-secondary">
                  Contact Us
                </Link>
              </div>
              <div className={styles.heroTrust}>
                <div className={styles.trustItem}>
                  <Shield size={16} className={styles.trustIcon} />
                  <span>Quality Guaranteed</span>
                </div>
                <div className={styles.trustItem}>
                  <Clock size={16} className={styles.trustIcon} />
                  <span>Quick Delivery</span>
                </div>
                <div className={styles.trustItem}>
                  <Ruler size={16} className={styles.trustIcon} />
                  <span>Perfect Fit Promise</span>
                </div>
              </div>
            </div>
            <div className={styles.heroImageContainer}>
              <div className={styles.heroImagePattern}></div>
              <div className={styles.heroImagePlaceholder}>
                {heroImages.length > 0 ? (
                  <Image
                    src={`/api/images/${heroImages[0].imageId}`}
                    alt={heroImages[0].label || "Custom tailoring"}
                    className={styles.heroImage}
                    fill
                    sizes="(max-width: 992px) 100vw, 50vw"
                    priority
                    fetchPriority="high"
                  />
                ) : (
                  <div className={styles.heroFallback}>
                    <Scissors size={48} />
                    <p>Upload a hero image from the admin panel</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={`section ${styles.featuresSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>WHY CHOOSE US</span>
              <h2 className={styles.sectionTitle}>Craftsmanship Meets Convenience</h2>
              <p className={styles.sectionSubtitle}>We bring traditional tailoring expertise into the digital age with our seamless online platform.</p>
            </div>
            <div className={styles.featuresGrid}>
              <div className={`card ${styles.featureCard}`}>
                <div className={styles.featureIconWrapper}>
                  <Scissors className={styles.featureIcon} />
                </div>
                <h3 className={styles.featureTitle}>Expert Tailoring</h3>
                <p className={styles.featureText}>We partner with the best local tailors to ensure premium stitching and finish on every garment.</p>
              </div>
              <div className={`card ${styles.featureCard}`}>
                <div className={styles.featureIconWrapper}>
                  <Ruler className={styles.featureIcon} />
                </div>
                <h3 className={styles.featureTitle}>Perfect Fit</h3>
                <p className={styles.featureText}>Submit your measurements online and save them for future orders. No more repeated visits to the tailor.</p>
              </div>
              <div className={`card ${styles.featureCard}`}>
                <div className={styles.featureIconWrapper}>
                  <Truck className={styles.featureIcon} />
                </div>
                <h3 className={styles.featureTitle}>Doorstep Delivery</h3>
                <p className={styles.featureText}>Get your stitched garments delivered to your doorstep or pick them up from the store.</p>
              </div>
              <div className={`card ${styles.featureCard}`}>
                <div className={styles.featureIconWrapper}>
                  <Shield className={styles.featureIcon} />
                </div>
                <h3 className={styles.featureTitle}>Quality Assured</h3>
                <p className={styles.featureText}>Every garment passes through a strict quality check before reaching you. 100% satisfaction guaranteed.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className={`section ${styles.howItWorks}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>HOW IT WORKS</span>
              <h2 className={styles.sectionTitle}>Three Simple Steps</h2>
              <p className={styles.sectionSubtitle}>Get your custom clothing in just three easy steps. No hassle, no fuss.</p>
            </div>
            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>
                <h3 className={styles.stepTitle}>Choose Your Style</h3>
                <p className={styles.stepText}>Browse our categories and pick the garment you want — shirts, suits, kurtas, blouses, and more.</p>
                <Link href="/categories" className={styles.stepLink}>
                  Browse Categories <ChevronRight size={16} />
                </Link>
              </div>
              <div className={styles.stepConnector}></div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>
                <h3 className={styles.stepTitle}>Submit Measurements</h3>
                <p className={styles.stepText}>Enter your body measurements or use a saved profile. Our guide makes it easy and accurate.</p>
                <Link href="/measurements" className={styles.stepLink}>
                  Add Measurements <ChevronRight size={16} />
                </Link>
              </div>
              <div className={styles.stepConnector}></div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>
                <h3 className={styles.stepTitle}>Get It Delivered</h3>
                <p className={styles.stepText}>Our expert tailors craft your garment and deliver it right to your doorstep within 7 days.</p>
                <Link href="/contact" className={styles.stepLink}>
                  Track Order <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaCard}>
              <h2 className={styles.ctaTitle}>Start Your Custom Tailoring Journey Today</h2>
              <p className={styles.ctaText}>Join thousands of happy customers who trust Tailor for premium, perfectly-fitted custom clothing.</p>
              <div className={styles.ctaActions}>
                <Link href="/signup" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                  Get Started Free <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                </Link>
                <Link href="/contact" className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                  Talk to Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
