'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, ImageIcon, Upload } from 'lucide-react';
import styles from './frontpage.module.css';
import { cachedFetch, invalidateCache } from '@/lib/apiCache';

export default function AdminFrontPageImages() {
  const [images, setImages] = useState([]);
  const [label, setLabel] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const data = await cachedFetch('/api/front-images', {}, 300);
      setImages(data.images || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageBase64) {
      alert('Please select an image');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/front-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, label: label || 'Hero Image' })
      });

      if (res.ok) {
        invalidateCache('/api/front-images');
        setLabel('');
        setImageBase64(null);
        e.target.reset();
        fetchImages();
      } else {
        alert('Failed to add image');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding image');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const res = await fetch(`/api/front-images?imageId=${imageId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        invalidateCache('/api/front-images');
        fetchImages();
      } else {
        alert('Failed to delete image');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Front Page Images</h1>
        <p className={styles.subtitle}>Manage the hero images displayed on the homepage.</p>
      </div>

      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>
          <Upload size={20} /> Add New Hero Image
        </h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Image Label (optional)</label>
              <input
                type="text"
                className={styles.input}
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Summer Collection"
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Select Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.input}
            />
            {imageBase64 && (
              <div className={styles.previewWrapper}>
                <img src={imageBase64} alt="Preview" className={styles.preview} />
              </div>
            )}
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading || !imageBase64}>
            {loading ? 'Uploading...' : <><Plus size={16} /> Add Image</>}
          </button>
        </form>
      </div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.formTitle}>Current Hero Images</h2>
        <span className={styles.count}>{images.length} image{images.length !== 1 ? 's' : ''}</span>
      </div>

      {fetching ? (
        <p className={styles.emptyText}>Loading...</p>
      ) : images.length === 0 ? (
        <div className={styles.emptyState}>
          <ImageIcon size={48} className={styles.emptyIcon} />
          <p className={styles.emptyText}>No hero images yet. Add one above to display on the homepage.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {images.map((img, index) => (
            <div key={img.imageId} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img src={`/api/images/${img.imageId}`} alt={img.label} className={styles.image} />
                <div className={styles.imageOverlay}>
                  <span className={styles.imageIndex}>#{index + 1}</span>
                </div>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.cardLabel}>{img.label || 'Hero Image'}</span>
                <button className={styles.deleteBtn} onClick={() => handleDelete(img.imageId)} title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
