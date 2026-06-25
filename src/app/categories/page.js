import Link from 'next/link';
import styles from './categories.module.css';

const categories = [
  { id: 'shirts', name: 'Shirts', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 'pants', name: 'Pants', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 'suits', name: 'Suits', image: 'https://images.unsplash.com/photo-1594938298598-718890fc5cb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 'kurtas', name: 'Kurtas', image: 'https://images.unsplash.com/photo-1583391733958-d25e07facd62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 'blouses', name: 'Blouses', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 'custom', name: 'Custom Designs', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
];

export default function CategoriesPage() {
  return (
    <div className={`container ${styles.categoriesContainer}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Browse Categories</h1>
        <p className={styles.subtitle}>Select a garment type to begin your custom tailoring journey.</p>
      </div>

      <div className={styles.grid}>
        {categories.map((cat) => (
          <Link href={`/measurements?category=${cat.id}`} key={cat.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img src={cat.image} alt={cat.name} className={styles.image} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{cat.name}</h3>
              <p className={styles.cardAction}>Start Customizing &rarr;</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
