import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Image, Download, Share2 } from 'lucide-react';

export default function ImageControls({ 
  zoom, 
  setZoom, 
  onResetCrop, 
  onChangeImage, 
  onDownload, 
  format 
}) {
  const handleZoomIn = () => setZoom(z => Math.min(4.0, z + 0.1));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z - 0.1));
  const handleZoomSlider = (e) => setZoom(parseFloat(e.target.value));

  return (
    <div className="image-controls-container glass-panel">
      <h4 className="controls-heading">Adjust Image</h4>
      
      {/* Zoom Settings */}
      <div className="control-row">
        <label className="control-label">Zoom Scale ({zoom.toFixed(1)}x)</label>
        <div className="slider-wrapper">
          <button className="icon-btn" onClick={handleZoomOut} aria-label="Zoom out">
            <ZoomOut size={16} />
          </button>
          <input 
            type="range" 
            min="0.5" 
            max="4.0" 
            step="0.05"
            value={zoom} 
            onChange={handleZoomSlider}
            className="zoom-slider"
          />
          <button className="icon-btn" onClick={handleZoomIn} aria-label="Zoom in">
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* Adjust Buttons */}
      <div className="control-actions">
        <button className="btn-secondary btn-sm" onClick={onResetCrop}>
          <RotateCcw size={14} />
          Reset Position
        </button>
        <button className="btn-secondary btn-sm" onClick={onChangeImage}>
          <Image size={14} />
          Change Photo
        </button>
      </div>

      {/* Output Actions */}
      <div className="export-actions-panel">
        <button className="btn-primary export-btn" onClick={onDownload}>
          <Download size={18} />
          Download Identity
        </button>
        
        <button className="btn-secondary export-btn" disabled>
          <Share2 size={18} />
          Share (Coming in Stage 2)
        </button>
      </div>

      <style>{`
        .image-controls-container {
          width: 100%;
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--color-border);
        }

        .controls-heading {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-text-secondary);
          border-bottom: 1px solid var(--color-border);
          padding-bottom: var(--spacing-sm);
          text-align: left;
        }

        .control-row {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          text-align: left;
        }

        .control-label {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .slider-wrapper {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--color-border);
          padding: 6px 12px;
          border-radius: var(--radius-md);
        }

        .zoom-slider {
          flex: 1;
          -webkit-appearance: none;
          background: rgba(255, 255, 255, 0.1);
          height: 4px;
          border-radius: 2px;
          outline: none;
        }

        .zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--color-accent-coral);
          cursor: pointer;
          transition: transform 0.1s ease;
        }

        .zoom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          padding: var(--spacing-xs);
          cursor: pointer;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          color: var(--color-text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .control-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .btn-sm {
          flex: 1;
          font-size: 0.85rem;
          padding: var(--spacing-sm) var(--spacing-md);
        }

        .export-actions-panel {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-sm);
          border-top: 1px solid var(--color-border);
          padding-top: var(--spacing-md);
        }

        .export-btn {
          width: 100%;
          padding: 12px;
          border-radius: var(--radius-md);
        }
      `}</style>
    </div>
  );
}
