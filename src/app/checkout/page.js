'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CreditCard, Banknote, MapPin, Store, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { cachedFetch } from '@/lib/apiCache';
import styles from './checkout.module.css';

function CheckoutContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category') || '';

  const [deliveryType, setDeliveryType] = useState('home');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [categoryName, setCategoryName] = useState('Custom Garment');
  const [categoryPrice, setCategoryPrice] = useState(999);
  const [showToast, setShowToast] = useState(false);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      const callbackPath = categorySlug 
        ? `/checkout?category=${categorySlug}`
        : '/checkout';
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
    }
  }, [status, router, categorySlug]);

  useEffect(() => {
    if (categorySlug) {
      cachedFetch('/api/categories', {}, 300)
        .then(data => {
          const cat = data.categories?.find(c => c.slug === categorySlug);
          if (cat) {
            setCategoryName(cat.name);
            setCategoryPrice(cat.price || 999);
          } else {
            // Fallback: capitalize words from slug
            setCategoryName(categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
            setCategoryPrice(999);
          }
        })
        .catch(err => console.error(err));
    }
  }, [categorySlug]);

  const totalAmount = categoryPrice + 300;

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          deliveryType, 
          deliveryAddress: deliveryType === 'home' ? deliveryAddress : null,
          paymentMethod,
          category: categoryName,
          totalAmount: totalAmount
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create order');
      }

      const data = await res.json();

      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/orders/' + data.orderId); // Redirect to order detail page
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className={`container ${styles.checkoutContainer}`} style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Verifying authentication status...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={`container ${styles.checkoutContainer} ${styles.successContainer}`}>
        <CheckCircle size={80} className={styles.successIcon} />
        <h1 className={styles.title}>Order Placed Successfully!</h1>
        <p className={styles.subtitle}>We'll notify you via a phone call with updates.</p>
        <p className={styles.redirectText}>Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`container ${styles.checkoutContainer}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Checkout</h1>
        <p className={styles.subtitle}>Complete your order to begin stitching.</p>
      </div>

      <div className={styles.checkoutGrid}>
        <form onSubmit={handleCheckout} className={styles.mainForm}>
          
          {/* Delivery Options */}
          <div className="card">
            <h2 className={styles.sectionTitle}>Delivery Options</h2>
            <div className={styles.optionsGrid}>
              <label className={`${styles.optionCard} ${deliveryType === 'home' ? styles.optionSelected : ''}`}>
                <input type="radio" name="delivery" value="home" checked={deliveryType === 'home'} onChange={() => setDeliveryType('home')} className={styles.hiddenRadio} />
                <MapPin size={24} className={styles.optionIcon} />
                <span className={styles.optionText}>Home Delivery</span>
              </label>
              <label className={`${styles.optionCard} ${deliveryType === 'shop' ? styles.optionSelected : ''}`}>
                <input type="radio" name="delivery" value="shop" checked={deliveryType === 'shop'} onChange={() => setDeliveryType('shop')} className={styles.hiddenRadio} />
                <Store size={24} className={styles.optionIcon} />
                <span className={styles.optionText}>Shop Pickup</span>
              </label>
            </div>
            
            {deliveryType === 'home' && (
              <div className={styles.addressForm}>
                <div className="form-group">
                  <label className="form-label">Full Address</label>
                  <textarea className="form-input" rows="3" placeholder="Enter your full delivery address" required value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)}></textarea>
                </div>
              </div>
            )}
          </div>

          {/* Payment Options */}
          <div className="card" style={{ marginTop: '2rem' }}>
            <h2 className={styles.sectionTitle}>Payment Method</h2>
            <div className={styles.optionsGrid}>
              <label className={`${styles.optionCard} ${paymentMethod === 'cod' ? styles.optionSelected : ''}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className={styles.hiddenRadio} />
                <Banknote size={24} className={styles.optionIcon} />
                <span className={styles.optionText}>Cash on Delivery</span>
              </label>
              <label className={`${styles.optionCard} ${styles.optionDisabled}`}
                onClick={(e) => { e.preventDefault(); setShowToast(true); setTimeout(() => setShowToast(false), 4000); }}
              >
                <input type="radio" name="payment" value="razorpay" disabled className={styles.hiddenRadio} />
                <CreditCard size={24} className={styles.optionIcon} />
                <span className={styles.optionText}>Razorpay / Online</span>
                <span className={styles.comingSoonBadge}>Coming Soon</span>
              </label>
            </div>

            {showToast && (
              <div className={styles.toastBanner}>
                <AlertTriangle size={18} />
                <span>Online payment is not available right now. Coming soon!</span>
                <button className={styles.toastClose} onClick={() => setShowToast(false)}><X size={16} /></button>
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : `Place Order • ₹${totalAmount.toLocaleString()}`}
            </button>
          </div>
        </form>

        <div className={styles.orderSummary}>
          <div className="card">
            <h2 className={styles.sectionTitle}>Order Summary</h2>
            <div className={styles.summaryItems}>
              <div className={styles.summaryItem}>
                <span>{categoryName}</span>
                <span>₹{categoryPrice.toLocaleString()}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Stitching Charges</span>
                <span>₹300</span>
              </div>
              {deliveryType === 'home' && (
                <div className={styles.summaryItem}>
                  <span>Delivery Fee</span>
                  <span>₹0 (Free)</span>
                </div>
              )}
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span className={styles.totalAmount}>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className={`container ${styles.checkoutContainer}`} style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading checkout...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
