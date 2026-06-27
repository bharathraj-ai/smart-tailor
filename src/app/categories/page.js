import styles from './categories.module.css';
import { getDb } from '@/lib/db';
import CategoriesList from './CategoriesList';

// Revalidate every 5 minutes instead of hitting DB on every request
export const revalidate = 300;

export default async function CategoriesPage() {
  const db = await getDb();
  const { data: categoriesData } = await db
    .from('categories')
    .select('*')
    .order('createdAt', { ascending: true });
  const categories = categoriesData || [];

  return (
    <div className={`container ${styles.categoriesContainer}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Browse Categories</h1>
        <p className={styles.subtitle}>Select a garment type to begin your custom tailoring journey.</p>
      </div>

      <CategoriesList categories={categories} />
    </div>
  );
}
