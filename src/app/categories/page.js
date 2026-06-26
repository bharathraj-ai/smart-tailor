import Link from 'next/link';
import styles from './categories.module.css';
import prisma from '@/lib/db';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className={`container ${styles.categoriesContainer}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Browse Categories</h1>
        <p className={styles.subtitle}>Select a garment type to begin your custom tailoring journey.</p>
      </div>

      <div className={styles.grid}>
        {categories.map((cat) => (
          <Link href={`/measurements?category=${cat.slug}`} key={cat.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img src={`/api/images/${cat.imageId}`} alt={cat.name} className={styles.image} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{cat.name}</h3>
              <p className={styles.cardAction}>Start Customizing &rarr;</p>
            </div>
          </Link>
        ))}
        {categories.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No categories found. Admin can add them in the dashboard.</p>}
      </div>
    </div>
  );
}
