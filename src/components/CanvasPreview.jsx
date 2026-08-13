import React, { useRef, useEffect, useState } from 'react';
import { Move } from 'lucide-react';
import { renderPfp, renderBuilderCard } from '../lib/rendering/canvasRenderer';

export default function CanvasPreview({ imageObj, format, zoom, setZoom, pan, setPan, canvasRef }) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  
  // Touch-pinch states
  const touchStartDist = useRef(0);
  const touchStartZoom = useRef(1.0);

  // Redraw canvas on state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format.id === 'pfp') {
      renderPfp(canvas, imageObj, zoom, pan.x, pan.y);
    } else if (format.id === 'builder-card') {
      renderBuilderCard(canvas, imageObj, zoom, pan.x, pan.y, {
        name: 'GOA BUILDER',
        role: 'HACKER / R1',
        github: 'hacker-goa-2026',
        status: 'VERIFIED PASS'
      });
    }
  }, [imageObj, format, zoom, pan, canvasRef]);

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (!imageObj) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !imageObj) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    // Scale movement to match canvas resolution relative to its displayed size
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      setPan(prev => ({
        x: prev.x + dx * scaleX,
        y: prev.y + dy * scaleY
      }));
    }
    
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (!imageObj) return;
    
    if (e.touches.length === 1) {
      // Single finger pan
      setIsDragging(true);
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      // Two finger pinch zoom
      setIsDragging(false); // disable panning during zoom
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      touchStartDist.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStartZoom.current = zoom;
    }
  };

  const handleTouchMove = (e) => {
    if (!imageObj) return;

    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        setPan(prev => ({
          x: prev.x + dx * scaleX,
          y: prev.y + dy * scaleY
        }));
      }
      
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      
      if (touchStartDist.current > 0) {
        const ratio = currentDist / touchStartDist.current;
        const newZoom = Math.min(Math.max(touchStartZoom.current * ratio, 0.5), 4.0);
        setZoom(newZoom);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDist.current = 0;
  };

  // Prevent scroll when dragging on touch devices
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventDefault = (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchmove', preventDefault, { passive: false });
    return () => {
      container.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  return (
    <div className="canvas-preview-section animate-fade-in">
      <div 
        ref={containerRef}
        className="canvas-container-outer glass-panel"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <canvas 
          ref={canvasRef}
          className={`preview-canvas ${format.id}`}
        />
      </div>
      
      <div className="interaction-tip">
        <Move size={14} className="coral-text" />
        <span>Drag inside frame to pan / Pinch or wheel to zoom</span>
      </div>

      <style>{`
        .canvas-preview-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          width: 100%;
        }

        .canvas-container-outer {
          padding: var(--spacing-md);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          cursor: grab;
          user-select: none;
          background: rgba(18, 20, 30, 0.5);
          overflow: hidden;
          max-width: 440px;
        }

        .canvas-container-outer:active {
          cursor: grabbing;
        }

        .preview-canvas {
          display: block;
          max-width: 100%;
          height: auto;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
          border-radius: var(--radius-sm);
        }

        .preview-canvas.pfp {
          aspect-ratio: 1/1;
          width: 100%;
        }

        .preview-canvas.builder-card {
          aspect-ratio: 2/3;
          width: 100%;
        }

        .interaction-tip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          opacity: 0.8;
          font-family: var(--font-mono);
          margin-top: var(--spacing-xs);
        }

        .coral-text {
          color: var(--color-accent-coral);
        }
      `}</style>
    </div>
  );
}
