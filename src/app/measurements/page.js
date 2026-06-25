'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './measurements.module.css';
import { Ruler, Upload, Save, ArrowRight } from 'lucide-react';

export default function MeasurementsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    chest: '',
    waist: '',
    hip: '',
    shoulder: '',
    sleeveLength: '',
    neckSize: '',
    height: '',
    customNotes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Proceed to checkout with measurements
    router.push('/checkout');
  };

  return (
    <div className={`container ${styles.measurementContainer}`}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Ruler size={32} className={styles.headerIcon} />
        </div>
        <h1 className={styles.title}>Your Measurements</h1>
        <p className={styles.subtitle}>Enter your exact body measurements in inches for a perfect fit.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.grid}>
          <div className="form-group">
            <label className="form-label">Chest (inches)</label>
            <input type="number" name="chest" className="form-input" value={formData.chest} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Waist (inches)</label>
            <input type="number" name="waist" className="form-input" value={formData.waist} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Hip (inches)</label>
            <input type="number" name="hip" className="form-input" value={formData.hip} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Shoulder (inches)</label>
            <input type="number" name="shoulder" className="form-input" value={formData.shoulder} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Sleeve Length (inches)</label>
            <input type="number" name="sleeveLength" className="form-input" value={formData.sleeveLength} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Neck Size (inches)</label>
            <input type="number" name="neckSize" className="form-input" value={formData.neckSize} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Height (inches)</label>
            <input type="number" name="height" className="form-input" value={formData.height} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Custom Notes for the Tailor</label>
          <textarea 
            name="customNotes" 
            className="form-input" 
            rows="4" 
            value={formData.customNotes} 
            onChange={handleChange}
            placeholder="E.g., I prefer a looser fit around the waist, or please add pockets."
          ></textarea>
        </div>

        <div className={styles.uploadSection}>
          <label className="form-label">Reference Design Image (Optional)</label>
          <div className={styles.uploadBox}>
            <Upload size={32} className={styles.uploadIcon} />
            <p>Click to upload or drag and drop</p>
            <span className={styles.uploadHint}>SVG, PNG, JPG or GIF (max. 800x400px)</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className="btn-secondary">
            <Save size={18} style={{ marginRight: '8px' }} /> Save for Later
          </button>
          <button type="submit" className="btn-primary">
            Proceed to Checkout <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </button>
        </div>
      </form>
    </div>
  );
}
