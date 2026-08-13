import React from 'react';
import { FORMATS } from '../lib/formats/formats';
import { Shield, Sparkles, Check } from 'lucide-react';

export default function FormatSelector({ selectedFormat, onSelectFormat }) {
  return (
    <div className="format-selector-container">
      <h3 className="selector-title">Select Format</h3>
      <div className="format-cards-grid">
        {Object.values(FORMATS).map((format) => {
          const isSelected = selectedFormat.id === format.id;
          return (
            <div 
              key={format.id}
              className={`format-card glass-panel ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectFormat(format)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectFormat(format); }}
            >
              <div className="format-card-header">
                <span className="format-card-name">{format.name}</span>
                {format.id === 'pfp' ? (
                  <Sparkles size={16} className="format-icon coral" />
                ) : (
                  <Shield size={16} className="format-icon teal" />
                )}
              </div>
              <p className="format-card-desc">{format.description}</p>
              
              <div className="format-card-footer">
                {format.id === 'builder-card' ? (
                  <span className="format-card-badge">Format B · 2:3 Badge</span>
                ) : (
                  <span className="format-card-badge pfp-badge">Format A · 1:1 Overlay</span>
                )}
                {isSelected && (
                  <span className="selected-indicator">
                    <Check size={12} /> Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .format-selector-container {
          width: 100%;
          margin-bottom: var(--spacing-sm);
        }

        .selector-title {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-text-muted);
          margin-bottom: var(--spacing-xs);
          text-align: left;
          font-weight: 700;
        }

        .format-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-sm);
        }

        @media (min-width: 640px) {
          .format-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .format-card {
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          cursor: pointer;
          position: relative;
          text-align: left;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--color-border);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .format-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.04);
        }

        .format-card.selected {
          border-color: var(--color-accent-coral);
          background: rgba(255, 90, 95, 0.04);
          box-shadow: 0 0 25px rgba(255, 90, 95, 0.08);
        }

        .format-card.selected::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--color-accent-coral);
        }

        .format-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .format-card-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .format-icon {
          transition: transform 0.3s ease;
        }

        .format-card:hover .format-icon {
          transform: scale(1.15) rotate(5deg);
        }

        .format-icon.coral {
          color: var(--color-accent-coral);
        }

        .format-icon.teal {
          color: var(--color-accent-teal);
        }

        .format-card-desc {
          font-size: 0.82rem;
          color: var(--color-text-secondary);
          line-height: 1.4;
          margin-bottom: var(--spacing-sm);
        }

        .format-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }

        .format-card-badge {
          background: rgba(0, 242, 254, 0.1);
          color: var(--color-accent-teal);
          border: 1px solid rgba(0, 242, 254, 0.2);
          font-family: var(--font-mono);
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .format-card-badge.pfp-badge {
          background: rgba(255, 90, 95, 0.1);
          color: var(--color-accent-coral);
          border: 1px solid rgba(255, 90, 95, 0.2);
        }

        .selected-indicator {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--color-accent-coral);
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
