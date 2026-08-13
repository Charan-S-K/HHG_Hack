import React, { useState, useRef } from 'react';
import { FORMATS } from './lib/formats/formats';
import UploadZone from './components/UploadZone';
import FormatSelector from './components/FormatSelector';
import CanvasPreview from './components/CanvasPreview';
import ImageControls from './components/ImageControls';
import { ShieldCheck, Flame, Compass, Loader } from 'lucide-react';
import { generateBuilderTitle } from './lib/utils/titleGenerator';

export default function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(FORMATS.PFP);
  
  // Lifted transform states
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Builder Card fields
  const [builderName, setBuilderName] = useState('GOA BUILDER');
  const [builderRole, setBuilderRole] = useState('HACKER / R1');
  const [builderGithub, setBuilderGithub] = useState('hacker-goa-2026');
  
  // Toast notifications & sharing state
  const [toast, setToast] = useState(null);
  const [isSharing, setIsSharing] = useState(false);

  const canvasRef = useRef(null);

  const builderTitle = generateBuilderTitle(builderName, builderRole);

  const showToast = (type, message, duration = 4000) => {
    setToast({ type, message });
    if (type !== 'loading') {
      setTimeout(() => {
        setToast(current => {
          if (current && current.message === message) {
            return null;
          }
          return current;
        });
      }, duration);
    }
  };

  const handleImageLoaded = (imageData) => {
    setUploadedImage(imageData);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    showToast('success', 'Image uploaded successfully!');
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
    showToast('info', 'Position reset');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    showToast('loading', 'Generating high quality download...');
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          showToast('error', 'Export failed. Could not generate image blob.');
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `hhg-goa-${selectedFormat.id}-${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('success', 'Pass downloaded successfully!');
      }, 'image/png');
    } catch (e) {
      console.error("Canvas download failed:", e);
      showToast('error', 'Download failed. Please try again.');
    }
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsSharing(true);
    showToast('loading', 'Preparing share link...');

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('error', 'Failed to generate image.');
          setIsSharing(false);
          return;
        }

        const caption = 'Just claimed my official builder pass for HH Goa 2026! Customize yours and #FrameInGoa';
        
        // 1. Try Web Share API (for mobile direct file sharing)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'pass.png', { type: 'image/png' })] })) {
          try {
            const file = new File([blob], 'hhg-pass.png', { type: 'image/png' });
            await navigator.share({
              files: [file],
              title: 'HH Goa 2026 Hacker Pass',
              text: caption,
            });
            showToast('success', 'Shared successfully!');
            setIsSharing(false);
            return;
          } catch (shareError) {
            console.log('Web Share failed, falling back to URL sharing:', shareError);
          }
        }

        // 2. Fallback to Link-based Sharing (Express backend)
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result;
          
          try {
            const response = await fetch('/api/temp-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ image: base64data }),
            });

            if (!response.ok) {
              throw new Error('Failed to upload image');
            }

            const data = await response.json();
            const shareUrl = data.url;

            // Generate pre-filled X intent URL
            const xIntentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(shareUrl)}`;
            
            window.open(xIntentUrl, '_blank', 'noopener,noreferrer');
            showToast('success', 'Opening X (Twitter)...');
          } catch (err) {
            console.error('Server upload failed:', err);
            showToast('error', 'Could not generate shareable link. Sharing caption only.');
            const xIntentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(caption)}`;
            window.open(xIntentUrl, '_blank', 'noopener,noreferrer');
          } finally {
            setIsSharing(false);
          }
        };
      }, 'image/png');
    } catch (e) {
      console.error('Error during share:', e);
      showToast('error', 'Something went wrong while sharing.');
      setIsSharing(false);
    }
  };

  return (
    <div className="app-container">
      {/* Premium Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-glow">
            <Flame className="logo-icon animate-pulse" size={24} />
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
              <h1 className="hero-title">
                Claim Your <span className="title-gradient">Hacker Pass</span>
              </h1>
              <p className="hero-description">
                Generate your custom profile frame and builder badge for the HH Goa 2026 Hackathon. Upload your photo to customize your identity card.
              </p>
            </div>
            
            <div className="upload-section-wrapper">
              <UploadZone onImageLoaded={handleImageLoaded} />
            </div>

            {/* Quick Promo Footer */}
            <div className="promo-footer">
              <div className="promo-item">
                <Compass size={18} />
                <span>Format A: Social PFP Overlay</span>
              </div>
              <div className="promo-item">
                <ShieldCheck size={18} />
                <span>Format B: Verification Badge</span>
              </div>
            </div>
          </div>
        ) : (
          /* EDITOR & PREVIEW SCREEN */
          <div className="editor-screen animate-fade-in">
            <div className="editor-header">
              <h2 className="editor-title">Customize Your Identity</h2>
              <p className="editor-subtitle">Adjust your photo's zoom and position, then input your details.</p>
            </div>

            <div className="editor-workspace">
              {/* Left Column: Formats & Adjustments */}
              <div className="workspace-controls">
                <FormatSelector 
                  selectedFormat={selectedFormat}
                  onSelectFormat={handleSelectFormat}
                />
                
                {selectedFormat.id === 'builder-card' && (
                  <div className="builder-details-form glass-panel animate-fade-in">
                    <h4 className="controls-heading">Builder Details</h4>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        value={builderName} 
                        onChange={(e) => setBuilderName(e.target.value)} 
                        placeholder="Enter your name" 
                        maxLength={20}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Stack / Role</label>
                      <input 
                        type="text" 
                        value={builderRole} 
                        onChange={(e) => setBuilderRole(e.target.value)} 
                        placeholder="e.g. Solidity / Frontend" 
                        maxLength={24}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GitHub Username</label>
                      <input 
                        type="text" 
                        value={builderGithub} 
                        onChange={(e) => setBuilderGithub(e.target.value)} 
                        placeholder="e.g. dev-user" 
                        maxLength={20}
                        className="form-input"
                      />
                    </div>
                    <div className="generated-title-preview">
                      <span className="preview-label">Generated Title</span>
                      <span className="preview-value">{builderTitle || 'Generating...'}</span>
                    </div>
                  </div>
                )}
                
                <ImageControls 
                  zoom={zoom}
                  setZoom={setZoom}
                  onResetCrop={handleResetCrop}
                  onChangeImage={handleResetImage}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  isSharing={isSharing}
                  format={selectedFormat}
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
                  builderName={builderName}
                  builderRole={builderRole}
                  builderGithub={builderGithub}
                  builderTitle={builderTitle}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>© HH Goa 2026. All credentials secured locally in your browser.</p>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type} animate-fade-in`}>
          {toast.type === 'loading' && <Loader className="toast-spinner" size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Custom Styles for App layout */}
      <style>{`
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-md) 0;
          border-bottom: 1px solid var(--color-border);
          margin-bottom: var(--spacing-xl);
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
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent-coral);
          box-shadow: 0 0 15px rgba(255, 90, 95, 0.15);
        }

        .logo-icon {
          animation: pulse 2s infinite ease-in-out;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }

        .logo-text {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: 0.05em;
          color: var(--color-text-primary);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 242, 254, 0.05);
          border: 1px solid rgba(0, 242, 254, 0.15);
          padding: 6px 12px;
          border-radius: 50px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }

        .teal-text {
          color: var(--color-accent-teal);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          margin-bottom: var(--spacing-xxl);
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
          gap: var(--spacing-sm);
        }

        .hero-title {
          font-size: 2.75rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }

        @media (min-width: 640px) {
          .hero-title {
            font-size: 3.5rem;
          }
        }

        .hero-description {
          font-size: 1.1rem;
          color: var(--color-text-secondary);
          max-width: 540px;
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
          margin-top: var(--spacing-md);
        }

        .promo-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--color-text-muted);
          font-size: 0.85rem;
          font-family: var(--font-mono);
        }

        /* Editor Screen Styles */
        .editor-screen {
          width: 100%;
          max-width: 1000px;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .editor-header {
          text-align: left;
          border-left: 3px solid var(--color-accent-coral);
          padding-left: var(--spacing-md);
          margin-bottom: var(--spacing-sm);
        }

        .editor-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--color-text-primary);
        }

        .editor-subtitle {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          margin-top: 4px;
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
            max-width: 480px;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
          }
          
          .workspace-canvas {
            flex: 1.2;
            display: flex;
            justify-content: center;
          }
        }

        /* Builder Form Styles */
        .builder-details-form {
          width: 100%;
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--color-border);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          text-align: left;
        }

        .form-label {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-secondary);
        }

        .form-input {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--color-text-primary);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          transition: all 0.2s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: var(--color-accent-coral);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 10px rgba(255, 90, 95, 0.1);
        }

        .generated-title-preview {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px 14px;
          background: rgba(255, 90, 95, 0.05);
          border: 1px dashed rgba(255, 90, 95, 0.2);
          border-radius: 8px;
          text-align: left;
        }

        .preview-label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--color-accent-coral);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .preview-value {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        /* Toast Notification Styles */
        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(18, 20, 30, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--color-border);
          padding: 12px 20px;
          border-radius: 12px;
          color: var(--color-text-primary);
          font-size: 0.9rem;
          font-weight: 500;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          pointer-events: none;
        }

        .toast::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          border-radius: 4px 0 0 4px;
        }

        .toast-success::before { background: var(--color-accent-lime); }
        .toast-error::before { background: var(--color-accent-coral); }
        .toast-info::before { background: var(--color-accent-teal); }
        .toast-loading::before { background: var(--color-accent-coral); }

        .toast-spinner {
          animation: spin 1s linear infinite;
          color: var(--color-accent-coral);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* App Footer */
        .app-footer {
          padding: var(--spacing-lg) 0;
          border-top: 1px solid var(--color-border);
          text-align: center;
        }

        .app-footer p {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
        }
      `}</style>
    </div>
  );
}
