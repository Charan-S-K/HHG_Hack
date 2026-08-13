import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Image, Download, Share2, RefreshCw, Wand2 } from 'lucide-react';
import { generateBuilderTitle } from '../lib/utils/titleGenerator';

// X / Twitter logo SVG inline (free, no external dependency)
function XLogo({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export default function ImageControls({
  zoom,
  setZoom,
  onResetCrop,
  onChangeImage,
  onDownload,
  onShare,
  format,
  name,
  setName,
  role,
  setRole,
  github,
  setGithub,
  onRegenerateTitle,
}) {
  const handleZoomIn = () => setZoom(z => Math.min(4.0, parseFloat((z + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, parseFloat((z - 0.1).toFixed(2))));
  const handleZoomSlider = (e) => setZoom(parseFloat(e.target.value));

  const isBuilderCard = format?.id === 'builder-card';

  return (
    <div className="image-controls-container glass-panel">

      {/* ── Identity Fields (only for Builder Card) ── */}
      {isBuilderCard && (
        <div className="identity-fields-section">
          <h4 className="controls-heading">Identity Fields</h4>

          <div className="form-field">
            <label htmlFor="field-name" className="form-label">Your Name</label>
            <input
              id="field-name"
              type="text"
              className="form-input"
              placeholder="e.g. Arjun Mehta"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 30))}
              maxLength={30}
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          <div className="form-field">
            <label htmlFor="field-role" className="form-label">Stack / Role</label>
            <div className="role-input-row">
              <input
                id="field-role"
                type="text"
                className="form-input"
                placeholder="e.g. Full-Stack Builder"
                value={role}
                onChange={(e) => setRole(e.target.value.slice(0, 45))}
                maxLength={45}
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="button"
                className="regenerate-btn"
                onClick={onRegenerateTitle}
                title="Generate random builder title"
                aria-label="Generate random builder title"
              >
                <Wand2 size={14} />
              </button>
            </div>
            <span className="form-hint">Or click ✦ to auto-generate a builder title</span>
          </div>

          <div className="form-field">
            <label htmlFor="field-github" className="form-label">GitHub Handle <span className="form-optional">(optional)</span></label>
            <div className="github-input-wrapper">
              <span className="github-prefix">@</span>
              <input
                id="field-github"
                type="text"
                className="form-input github-input"
                placeholder="your-handle"
                value={github}
                onChange={(e) => setGithub(e.target.value.replace(/[@\s]/g, '').slice(0, 39))}
                maxLength={39}
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Zoom / Crop ── */}
      <div className="crop-section">
        <h4 className="controls-heading">Adjust Crop</h4>

        <div className="control-row">
          <div className="zoom-label-row">
            <span className="control-label">Zoom</span>
            <span className="zoom-value">{zoom.toFixed(1)}×</span>
          </div>
          <div className="slider-wrapper">
            <button className="icon-btn" onClick={handleZoomOut} aria-label="Zoom out">
              <ZoomOut size={15} />
            </button>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.05"
              value={zoom}
              onChange={handleZoomSlider}
              className="zoom-slider"
              aria-label="Zoom level"
            />
            <button className="icon-btn" onClick={handleZoomIn} aria-label="Zoom in">
              <ZoomIn size={15} />
            </button>
          </div>
        </div>

        <div className="control-actions">
          <button className="btn-secondary btn-sm" onClick={onResetCrop}>
            <RotateCcw size={13} />
            Reset
          </button>
          <button className="btn-secondary btn-sm" onClick={onChangeImage}>
            <Image size={13} />
            Change Photo
          </button>
        </div>
      </div>

      {/* ── Export Actions ── */}
      <div className="export-actions-panel">
        <button
          id="btn-download"
          className="btn-primary export-btn"
          onClick={onDownload}
        >
          <Download size={17} />
          Download Image
        </button>

        <button
          id="btn-share-x"
          className="btn-share export-btn"
          onClick={onShare}
        >
          <XLogo size={15} />
          Share on X with <strong>#FrameInGoa</strong>
        </button>
      </div>

      <style>{`
        .image-controls-container {
          width: 100%;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 0;
          background: rgba(15, 17, 26, 0.65);
          border: 1px solid var(--color-border);
          overflow: hidden;
        }

        .identity-fields-section {
          padding: var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          border-bottom: 1px solid var(--color-border);
        }

        .crop-section {
          padding: var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          border-bottom: 1px solid var(--color-border);
        }

        .controls-heading {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--color-text-muted);
          font-weight: 700;
          margin-bottom: 2px;
        }

        .role-input-row {
          display: flex;
          gap: var(--spacing-xs);
          align-items: center;
        }

        .role-input-row .form-input {
          flex: 1;
        }

        .regenerate-btn {
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          background: rgba(167, 255, 55, 0.08);
          border: 1px solid rgba(167, 255, 55, 0.2);
          color: var(--color-accent-lime);
          padding: 0;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .regenerate-btn:hover {
          background: rgba(167, 255, 55, 0.14);
          border-color: rgba(167, 255, 55, 0.4);
          transform: rotate(12deg) scale(1.05);
        }

        .regenerate-btn:active {
          transform: rotate(180deg) scale(0.95);
        }

        .form-optional {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: var(--color-text-muted);
          font-weight: 400;
          text-transform: lowercase;
          letter-spacing: 0;
        }

        .github-input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .github-input-wrapper:focus-within {
          border-color: var(--color-accent-coral);
          box-shadow: 0 0 0 3px rgba(255, 90, 95, 0.12);
        }

        .github-prefix {
          padding: 0 10px;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
          font-size: 0.95rem;
          user-select: none;
          flex-shrink: 0;
          border-right: 1px solid var(--color-border);
          line-height: 1;
          align-self: stretch;
          display: flex;
          align-items: center;
        }

        .github-input {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          font-family: var(--font-mono);
          font-size: 0.9rem;
          padding-left: 10px;
        }

        .github-input:focus {
          box-shadow: none !important;
        }

        .zoom-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .control-label {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .zoom-value {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--color-accent-teal);
          background: rgba(0, 242, 254, 0.06);
          border: 1px solid rgba(0, 242, 254, 0.15);
          padding: 1px 8px;
          border-radius: var(--radius-xs);
        }

        .slider-wrapper {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--color-border);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
        }

        .zoom-slider {
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255, 255, 255, 0.08);
          height: 3px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          min-width: 0;
        }

        .zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-accent-coral);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 0 0 2px rgba(255, 90, 95, 0.2);
        }

        .zoom-slider::-webkit-slider-thumb:hover,
        .zoom-slider::-webkit-slider-thumb:active {
          transform: scale(1.25);
          box-shadow: 0 0 0 4px rgba(255, 90, 95, 0.25);
        }

        .zoom-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-accent-coral);
          cursor: pointer;
          border: none;
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          padding: 4px;
          cursor: pointer;
          border-radius: var(--radius-xs);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease, background 0.2s ease;
          flex-shrink: 0;
        }

        .icon-btn:hover {
          color: var(--color-text-primary);
          background: rgba(255, 255, 255, 0.07);
        }

        .control-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .btn-sm {
          flex: 1;
          font-size: 0.82rem;
          padding: 8px var(--spacing-sm);
          border-radius: var(--radius-sm);
        }

        .export-actions-panel {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
        }

        .export-btn {
          width: 100%;
          padding: 13px var(--spacing-md);
          border-radius: var(--radius-md);
          font-size: 0.93rem;
          letter-spacing: 0.01em;
        }

        .export-btn strong {
          font-weight: 800;
        }

        @media (max-width: 480px) {
          .export-btn {
            font-size: 0.85rem;
            padding: 11px var(--spacing-sm);
          }
        }
      `}</style>
    </div>
  );
}
