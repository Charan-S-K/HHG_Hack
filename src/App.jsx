import React, { useState, useRef } from 'react';
import { FORMATS } from './lib/formats/formats';
import UploadZone from './components/UploadZone';
import FormatSelector from './components/FormatSelector';
import CanvasPreview from './components/CanvasPreview';
import ImageControls from './components/ImageControls';
import { ShieldCheck, Flame, Compass, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { generateBuilderTitle } from './lib/utils/titleGenerator';

export default function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(FORMATS.PFP);
  
  // Custom Identity Fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [github, setGithub] = useState('');

  // Lifted transform states
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Toast Notification System
  const [toast, setToast] = useState(null); // { id, message, type: 'success'|'error'|'info' }
  const toastTimeoutRef = useRef(null);

  const canvasRef = useRef(null);

  const showNotification = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    const id = Date.now();
    setToast({ id, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleImageLoaded = (imageData) => {
    setUploadedImage(imageData);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    
    // Auto-populate default name/role if empty
    if (!name) {
      setName('HH GOA BUILDER');
    }
    if (!role) {
      setRole(generateBuilderTitle('HH GOA BUILDER'));
    }

    showNotification('Image loaded successfully! Adjust crop and fields below.', 'success');
  };

  const handleSelectFormat = (format) => {
    setSelectedFormat(format);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const handleResetImage = () => {
    setUploadedImage(null);
    setSelectedFormat(FORMATS.PFP);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const handleResetCrop = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    showNotification('Position reset to default', 'info');
  };

  const handleRegenerateTitle = () => {
    const newTitle = generateBuilderTitle(name || String(Date.now()));
    setRole(newTitle);
    showNotification(`Generated title: "${newTitle}"`, 'info');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      showNotification('Canvas preview is not available.', 'error');
      return;
    }

    try {
      const formatSuffix = selectedFormat.id === 'pfp' ? 'pfp-frame' : 'builder-card';
      const fileName = `HH-Goa-2026-${formatSuffix}-${Date.now()}.png`;

      // Export high quality PNG
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification(`Identity graphic downloaded as ${fileName}!`, 'success');
    } catch (e) {
      console.error("Canvas download failed:", e);
      showNotification('Download failed. Please try again.', 'error');
    }
  };

  const handleShare = () => {
    const builderName = name.trim() || 'HH Goa Builder';
    const captionText = `Just claimed my official #FrameInGoa Builder Pass for HH Goa 2026! 🚀\n\nBuilding with @hackerhousegoa — see you in Goa! 🌴✨\n\n#HHGoa2026 #Hackathon #FrameInGoa`;
    const shareUrl = window.location.origin;

    const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(captionText)}&url=${encodeURIComponent(shareUrl)}`;
    
    // Open X Share popup
    window.open(twitterIntent, '_blank', 'noopener,noreferrer,width=600,height=500');

    showNotification('Share dialog opened! Don\'t forget to attach your downloaded graphic to your tweet.', 'info');
  };

  return (
    <div className="app-container">
      {/* Premium Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-glow">
            <Flame className="logo-icon" size={22} />
          </div>
          <span className="logo-text">HH GOA 2026</span>
        </div>
        
        <div className="badge-section">
          <span className="status-badge">
            <ShieldCheck size={14} className="teal-text" />
            Identity Studio v1.0
          </span>
        </div>
      </header>

      {/* Main Flow Content */}
      <main className="main-content">
        {!uploadedImage ? (
          /* LANDING & UPLOAD SCREEN */
          <div className="landing-screen animate-fade-in">
            <div className="hero-text-wrapper">
              <div className="hero-pill">
                <Sparkles size={14} className="coral-text" />
                <span>Official HH Goa 2026 Studio</span>
              </div>
              <h1 className="hero-title">
                Claim Your <span className="title-gradient">Hacker Pass</span>
              </h1>
              <p className="hero-description">
                Generate your official profile frame and builder badge for HH Goa 2026. Custom design, zero cost, 100% private in your browser.
              </p>
            </div>
            
            <div className="upload-section-wrapper">
              <UploadZone onImageLoaded={handleImageLoaded} />
            </div>

            {/* Feature Callouts */}
            <div className="promo-footer">
              <div className="promo-item">
                <Compass size={16} />
                <span>Format A: Social PFP Overlay</span>
              </div>
              <div className="promo-item">
                <ShieldCheck size={16} />
                <span>Format B: Verified Builder Card</span>
              </div>
            </div>
          </div>
        ) : (
          /* EDITOR & PREVIEW SCREEN */
          <div className="editor-screen animate-fade-in">
            <div className="editor-header">
              <h2 className="editor-title">Customize Your Card</h2>
              <p className="editor-subtitle">Adjust your details, position your photo, and select your design format.</p>
            </div>

            <div className="editor-workspace">
              {/* Left Column: Formats & Adjustments */}
              <div className="workspace-controls">
                <FormatSelector 
                  selectedFormat={selectedFormat}
                  onSelectFormat={handleSelectFormat}
                />
                
                <ImageControls 
                  zoom={zoom}
                  setZoom={setZoom}
                  onResetCrop={handleResetCrop}
                  onChangeImage={handleResetImage}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  format={selectedFormat}
                  name={name}
                  setName={setName}
                  role={role}
                  setRole={setRole}
                  github={github}
                  setGithub={setGithub}
                  onRegenerateTitle={handleRegenerateTitle}
                />
              </div>

              {/* Right Column: Live Interactive Canvas */}
              <div className="workspace-canvas">
                <CanvasPreview 
                  imageObj={uploadedImage.imageObj}
                  format={selectedFormat}
                  zoom={zoom}
                  setZoom={setZoom}
                  pan={pan}
                  setPan={setPan}
                  canvasRef={canvasRef}
                  name={name}
                  role={role}
                  github={github}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>© HH Goa 2026 · Built for #FrameInGoa · All credentials processed locally in browser</p>
      </footer>

      {/* Toast Notification Banner */}
      {toast && (
        <div className="toast-container" role="status" aria-live="polite">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Custom Scoped Styles for Header, Footer & Landing */}
      <style>{`
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-sm) 0;
          border-bottom: 1px solid var(--color-border);
          margin-bottom: var(--spacing-lg);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .logo-glow {
          background: rgba(255, 90, 95, 0.1);
          border: 1px solid rgba(255, 90, 95, 0.25);
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent-coral);
          box-shadow: 0 0 15px rgba(255, 90, 95, 0.12);
        }

        .logo-text {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 1.05rem;
          letter-spacing: 0.05em;
          color: var(--color-text-primary);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 242, 254, 0.05);
          border: 1px solid rgba(0, 242, 254, 0.15);
          padding: 5px 12px;
          border-radius: 50px;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--color-text-secondary);
        }

        .teal-text {
          color: var(--color-accent-teal);
        }

        .coral-text {
          color: var(--color-accent-coral);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          margin-bottom: var(--spacing-xl);
        }

        /* Landing Screen Styles */
        .landing-screen {
          width: 100%;
          text-align: center;
          max-width: 680px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xl);
        }

        .hero-text-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 90, 95, 0.08);
          border: 1px solid rgba(255, 90, 95, 0.2);
          padding: 4px 12px;
          border-radius: 50px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--color-accent-coral);
          font-weight: 700;
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }

        @media (min-width: 640px) {
          .hero-title {
            font-size: 3.5rem;
          }
        }

        .hero-description {
          font-size: 1.05rem;
          color: var(--color-text-secondary);
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .upload-section-wrapper {
          width: 100%;
        }

        .promo-footer {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--spacing-lg);
          margin-top: var(--spacing-sm);
        }

        .promo-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--color-text-muted);
          font-size: 0.82rem;
          font-family: var(--font-mono);
        }

        /* Editor Screen Styles */
        .editor-screen {
          width: 100%;
          max-width: 1040px;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .editor-header {
          text-align: left;
          border-left: 3px solid var(--color-accent-coral);
          padding-left: var(--spacing-md);
          margin-bottom: var(--spacing-xs);
        }

        .editor-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--color-text-primary);
        }

        .editor-subtitle {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          margin-top: 2px;
        }

        .editor-workspace {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xl);
          width: 100%;
        }

        @media (min-width: 768px) {
          .editor-workspace {
            flex-direction: row;
            align-items: flex-start;
          }
          
          .workspace-controls {
            flex: 1;
            max-width: 460px;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
          }
          
          .workspace-canvas {
            flex: 1.2;
            display: flex;
            justify-content: center;
            position: sticky;
            top: 20px;
          }
        }

        /* App Footer */
        .app-footer {
          padding: var(--spacing-md) 0;
          border-top: 1px solid var(--color-border);
          text-align: center;
          margin-top: auto;
        }

        .app-footer p {
          font-size: 0.78rem;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
        }
      `}</style>
    </div>
  );
}
