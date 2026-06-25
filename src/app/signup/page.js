'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import styles from '../auth.module.css';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/login');
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent)' }}>
            <UserPlus size={40} />
          </div>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join SmartTailor to order custom clothes.</p>
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              name="name" 
              className="form-input" 
              placeholder="e.g., Rahul Sharma" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label className="form-label">Email</label>
            <input 
              type="email" 
              name="email" 
              className="form-input" 
              placeholder="Enter your email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label className="form-label">Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              className="form-input" 
              placeholder="numberxxxxxxx" 
              value={formData.phone} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password" 
              className="form-input" 
              placeholder="Create a password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
            Sign Up
          </button>
        </form>

        <div className={styles.authFooter}>
          Already have an account? 
          <Link href="/login" className={styles.authLink}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
