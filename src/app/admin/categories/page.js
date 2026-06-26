'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import styles from './categories.module.css';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
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
    if (!name || !slug || !imageBase64) {
      alert('Please fill all fields and select an image');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, imageBase64 })
      });
      
      if (res.ok) {
        setName('');
        setSlug('');
        setImageBase64(null);
        e.target.reset();
        fetchCategories();
      } else {
        alert('Failed to add category');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCategories();
      } else {
        alert('Failed to delete category');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Categories</h1>
      </div>

      <div className={styles.formCard}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Add New Category</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label>Category Name</label>
              <input 
                type="text" 
                className={styles.input} 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. T-Shirts"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Slug</label>
              <input 
                type="text" 
                className={styles.input} 
                value={slug} 
                onChange={e => setSlug(e.target.value)} 
                placeholder="e.g. t-shirts"
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Category Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className={styles.input}
            />
            {imageBase64 && (
              <img src={imageBase64} alt="Preview" style={{ height: '100px', objectFit: 'contain', marginTop: '0.5rem', borderRadius: '4px' }} />
            )}
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Adding...' : <><Plus size={16} style={{ marginRight: '8px' }} /> Add Category</>}
          </button>
        </form>
      </div>

      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Existing Categories</h2>
      <div className={styles.grid}>
        {categories.map(cat => (
          <div key={cat.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img src={`/api/images/${cat.imageId}`} alt={cat.name} className={styles.image} />
            </div>
            <div className={styles.cardContent}>
              <span className={styles.cardTitle}>{cat.name}</span>
              <button className={styles.deleteBtn} onClick={() => handleDelete(cat.id)} title="Delete">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No categories found.</p>}
      </div>
    </div>
  );
}
