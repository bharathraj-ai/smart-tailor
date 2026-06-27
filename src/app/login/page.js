'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-fill and auto-submit login from URL parameters if provided
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const passwordParam = params.get('password');
    
    if (emailParam || passwordParam) {
      setFormData({
        email: emailParam || '',
        password: passwordParam || ''
      });

      if (emailParam && passwordParam) {
        console.log('[Auto-Login] Attempting sign-in for:', emailParam);
        const autoLoginSubmit = async () => {
          setLoading(true);
          setError('');
          try {
            await signIn('credentials', {
              email: emailParam,
              password: passwordParam,
              redirect: true,
              callbackUrl: '/profile'
            });
          } catch (err) {
            console.error('[Auto-Login] Exception occurred:', err);
            setError('An error occurred during auto-login');
            setLoading(false);
          }
        };
        autoLoginSubmit();
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: true,
        callbackUrl: '/profile'
      });

      if (res?.error) {
        setError('Invalid email or password');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent)' }}>
            <LogIn size={40} />
          </div>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your SmartTailor account.</p>
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit}>
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
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password" 
              className="form-input" 
              placeholder="Enter your password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
            Sign In
          </button>
        </form>

        <div className={styles.authFooter}>
          Don't have an account? 
          <Link href="/signup" className={styles.authLink}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
