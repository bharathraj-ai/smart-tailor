'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, MapPin, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './edit.module.css';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Fetch current user data on load
  useEffect(() => {
    async function fetchProfile() {
      try {
        // We can just use the existing GET /api/auth/session to get basic info 
        // but we need phone and address from db. Since we don't have a GET /api/user/profile 
        // We will just fetch it from a new generic route or create one.
        // Wait, the profile page itself uses server components. We can fetch using a server action 
        // or just add a quick GET to the route we just created.
        
        // For simplicity, let's just make a GET request to the profile route.
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setFormData({
              name: data.user.name || '',
              phone: data.user.phone || '',
              address: data.user.address || ''
            });
          }
        } else {
          setError('Failed to load profile data');
        }
      } catch (err) {
        setError('An error occurred while loading profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        // Redirect back to profile page
        router.push('/profile');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/profile" className={styles.backBtn}>
          <ArrowLeft size={20} /> Back to Profile
        </Link>
        <h1 className={styles.title}>Edit Profile</h1>
        <p className={styles.subtitle}>Update your personal information and delivery address.</p>
      </div>

      <div className={`card ${styles.formCard}`}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className={`form-input ${styles.inputWithIcon}`}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className={styles.inputWrapper}>
              <Phone size={18} className={styles.inputIcon} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                className={`form-input ${styles.inputWithIcon}`}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Address</label>
            <div className={styles.inputWrapper}>
              <MapPin size={18} className={styles.inputIcon} />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Your complete delivery address"
                className={`form-input ${styles.inputWithIcon} ${styles.textarea}`}
                rows={4}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={saving}
          >
            {saving ? 'Saving Changes...' : <><Save size={18} style={{ marginRight: '8px' }} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}
