'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './measurements.module.css';
import { Ruler, Upload, Save, ArrowRight, Camera, X } from 'lucide-react';

function MeasurementsContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category') || '';

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // File Upload and Camera States
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [previewImage, setPreviewImage] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      const callbackPath = categorySlug 
        ? `/measurements?category=${categorySlug}`
        : '/measurements';
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
    }
  }, [status, router, categorySlug]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, or JPEG).');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Prefer rear camera on mobile
        audio: false
      });
      setStream(mediaStream);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Could not access camera. Please check browser permissions or upload a file instead.");
      setShowCamera(false);
    }
  };

  // Connect video element to stream once active
  useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [showCamera, stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPreviewImage(dataUrl);
      
      stopCamera();
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Pack notes and image base64 together
    const combinedNotes = previewImage 
      ? `${formData.customNotes || ''}|||${previewImage}`
      : formData.customNotes;

    try {
      const res = await fetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customNotes: combinedNotes
        })
      });
      
      if (res.ok) {
        router.push(`/checkout${categorySlug ? `?category=${categorySlug}` : ''}`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to save measurements: ${res.status} - ${errorData.error || 'Unknown error'}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  // Render a clean loading skeleton while verifying authorization
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className={`container ${styles.measurementContainer}`} style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Verifying authentication status...</p>
      </div>
    );
  }

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

        {/* Reference Image Capture/Upload Section */}
        <div className={styles.uploadSection}>
          <label className="form-label">Reference Design Image (Optional)</label>
          
          {previewImage ? (
            <div className={styles.previewContainer}>
              <img src={previewImage} alt="Design preview" className={styles.previewImg} />
              <button 
                type="button" 
                className={styles.removeBtn} 
                onClick={handleRemoveImage}
              >
                <X size={16} style={{ marginRight: '6px' }} /> Remove Image
              </button>
            </div>
          ) : (
            <div className={styles.uploadContainer}>
              <div 
                className={styles.uploadBox}
                onClick={triggerFileSelect}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={isDragging ? { borderColor: 'var(--accent)', backgroundColor: 'rgba(217, 119, 6, 0.05)' } : {}}
              >
                <Upload size={32} className={styles.uploadIcon} />
                <p>Click to upload or drag and drop</p>
                <span className={styles.uploadHint}>PNG, JPG or JPEG (max. 5MB)</span>
              </div>
              
              <button 
                type="button" 
                className={styles.cameraBtn}
                onClick={startCamera}
              >
                <Camera size={18} style={{ marginRight: '8px' }} /> Take Photo with Camera
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" className="btn-secondary">
            <Save size={18} style={{ marginRight: '8px' }} /> Save for Later
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : <>Proceed to Checkout <ArrowRight size={18} style={{ marginLeft: '8px' }} /></>}
          </button>
        </div>
      </form>

      {/* WebRTC Shutter Camera overlay */}
      {showCamera && (
        <div className={styles.cameraOverlay}>
          <div className={styles.cameraModal}>
            <button 
              type="button" 
              className={styles.closeCameraBtn}
              onClick={stopCamera}
              aria-label="Close camera"
            >
              <X size={20} />
            </button>
            <h3 className={styles.cameraTitle}>Capture Reference Design</h3>
            
            <div className={styles.videoContainer}>
              <video ref={videoRef} autoPlay playsInline className={styles.videoStream} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <div className={styles.cameraActions}>
              <button 
                type="button" 
                className={styles.shutterBtn} 
                onClick={capturePhoto}
                title="Capture photo"
              >
                <span className={styles.shutterInner} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MeasurementsPage() {
  return (
    <Suspense fallback={
      <div className={`container ${styles.measurementContainer}`} style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading measurements form...</p>
      </div>
    }>
      <MeasurementsContent />
    </Suspense>
  );
}
