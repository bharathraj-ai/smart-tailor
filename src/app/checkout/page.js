'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Banknote, MapPin, Store, CheckCircle } from 'lucide-react';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const [deliveryType, setDeliveryType] = useState('home');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCheckout = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/orders/latest'); // Redirect to order detail page
      }, 2000);
    }, 1500);
  };

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
                  <textarea className="form-input" rows="3" placeholder="Enter your full delivery address" required></textarea>
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
              <label className={`${styles.optionCard} ${paymentMethod === 'razorpay' ? styles.optionSelected : ''}`}>
                <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className={styles.hiddenRadio} />
                <CreditCard size={24} className={styles.optionIcon} />
                <span className={styles.optionText}>Razorpay / Online</span>
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : `Place Order • ₹1,299`}
            </button>
          </div>
        </form>

        <div className={styles.orderSummary}>
          <div className="card">
            <h2 className={styles.sectionTitle}>Order Summary</h2>
            <div className={styles.summaryItems}>
              <div className={styles.summaryItem}>
                <span>Custom Shirt (Cotton)</span>
                <span>₹999</span>
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
              <span className={styles.totalAmount}>₹1,299</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
