'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import styles from './categories.module.css';

export default function CategoriesList({ categories }) {
  const [activeImage, setActiveImage] = useState(null);

  // Close lightbox on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className={styles.grid}>
        {categories.map((cat) => (
          <div key={cat.id} className={styles.card}>
            {/* Image click opens Lightbox */}
            <div 
              className={styles.imageWrapper} 
              onClick={() => setActiveImage(`/api/images/${cat.imageId}`)}
              title="View larger image"
            >
              <Image 
                src={`/api/images/${cat.imageId}`} 
                alt={cat.name} 
                className={styles.image}
                fill
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
                loading="lazy"
              />
            </div>
            
            {/* Text details and button click triggers normal redirect */}
            <Link href={`/measurements?category=${cat.slug}`} className={styles.cardContent}>
              <div>
                <h3 className={styles.cardTitle}>{cat.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Starting from ₹{cat.price || '999'}
                </p>
              </div>
              <p className={styles.cardAction} style={{ marginTop: '0.75rem' }}>Start Customizing &rarr;</p>
            </Link>
          </div>
        ))}
        {categories.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>
            No categories found. Admin can add them in the dashboard.
          </p>
        )}
      </div>

      {/* Lightbox modal overlay */}
      {activeImage && (
        <div 
          className={styles.lightbox} 
          onClick={() => setActiveImage(null)}
        >
          <button 
            className={styles.closeBtn} 
            onClick={() => setActiveImage(null)}
            aria-label="Close image preview"
          >
            <X size={28} />
          </button>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <img src={activeImage} alt="Category preview image" className={styles.lightboxImg} />
          </div>
        </div>
      )}
    </>
  );
}
