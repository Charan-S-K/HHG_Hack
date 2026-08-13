import React, { useState, useRef } from 'react';
import { FORMATS } from './lib/formats/formats';
import UploadZone from './components/UploadZone';
import FormatSelector from './components/FormatSelector';
import CanvasPreview from './components/CanvasPreview';
import ImageControls from './components/ImageControls';
import { ShieldCheck, Flame, Compass } from 'lucide-react';

export default function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(FORMATS.PFP);
  
  // Lifted transform states
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);

  const handleImageLoaded = (imageData) => {
    setUploadedImage(imageData);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
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
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `hhg-goa-${selectedFormat.id}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Canvas download failed:", e);
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
              <h2 className="editor-title">Customize Your Card</h2>
              <p className="editor-subtitle">Adjust your crop and select the design format below.</p>
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
