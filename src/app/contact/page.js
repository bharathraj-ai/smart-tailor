'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import styles from './contact.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className={styles.contactPage}>
      {/* Hero */}
      <section className={styles.contactHero}>
        <div className="container">
          <span className={styles.contactBadge}><Mail size={14} /> Get In Touch</span>
          <h1 className={styles.contactTitle}>We'd Love to Hear From You</h1>
          <p className={styles.contactSubtitle}>
            Have a question, feedback, or need help with your order? Reach out and we'll get back to you promptly.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="container">
        <div className={styles.contactGrid}>
          {/* Form */}
          <div className={`card ${styles.formCard}`}>
            {!submitted ? (
              <>
                <h2 className={styles.formTitle}>Send a Message</h2>
                <p className={styles.formSubtitle}>Fill out the form below and we'll respond within 24 hours.</p>
                <form onSubmit={handleSubmit}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={styles.formInput}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className={styles.formInput}
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Order inquiry"
                        className={styles.formInput}
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      className={styles.formTextarea}
                      required
                    />
                  </div>
                  <button type="submit" className={styles.formButton} disabled={loading}>
                    {loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
                  </button>
                </form>
              </>
            ) : (
              <div className={styles.successMessage}>
                <CheckCircle size={56} className={styles.successIcon} />
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button 
                  onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                  className={styles.formButton}
                  style={{ marginTop: '1.5rem', maxWidth: '200px', margin: '1.5rem auto 0' }}
                >
                  Send Another
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.infoSection}>
            <div className={`card ${styles.infoCard}`}>
              <div className={styles.infoIconWrapper}><MapPin size={22} /></div>
              <div className={styles.infoContent}>
                <h3>Our Location</h3>
                <p>123 Tailor Street, Fashion District<br />City, State - 560001</p>
              </div>
            </div>

            <div className={`card ${styles.infoCard}`}>
              <div className={styles.infoIconWrapper}><Phone size={22} /></div>
              <div className={styles.infoContent}>
                <h3>Phone</h3>
                <p><a href="tel:+919876543210">+91 98765 43210</a></p>
                <p><a href="tel:+919876543211">+91 98765 43211</a></p>
              </div>
            </div>

            <div className={`card ${styles.infoCard}`}>
              <div className={styles.infoIconWrapper}><Mail size={22} /></div>
              <div className={styles.infoContent}>
                <h3>Email</h3>
                <p><a href="mailto:hello@smarttailor.com">hello@smarttailor.com</a></p>
                <p><a href="mailto:support@smarttailor.com">support@smarttailor.com</a></p>
              </div>
            </div>

            <div className={`card ${styles.hoursCard}`}>
              <h3 className={styles.hoursTitle}><Clock size={18} className={styles.hoursIcon} /> Business Hours</h3>
              <ul className={styles.hoursList}>
                <li><span className={styles.hoursDay}>Monday - Friday</span><span className={styles.hoursTime}>9:00 AM - 8:00 PM</span></li>
                <li><span className={styles.hoursDay}>Saturday</span><span className={styles.hoursTime}>10:00 AM - 6:00 PM</span></li>
                <li><span className={styles.hoursDay}>Sunday</span><span className={styles.hoursTime}>Closed</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
