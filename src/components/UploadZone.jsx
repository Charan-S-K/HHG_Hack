import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, AlertCircle, Loader, Camera } from 'lucide-react';
import { isHEIC, convertHEIC } from '../lib/image-processing/heicConverter';

const MAX_FILE_SIZE_MB = 25;

export default function UploadZone({ onImageLoaded }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsLoading(true);
    setErrorMessage('');

    try {
      // File size check
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_FILE_SIZE_MB) {
        setErrorMessage(`File is too large (${sizeMB.toFixed(1)} MB). Please upload an image under ${MAX_FILE_SIZE_MB} MB.`);
        setIsLoading(false);
        return;
      }

      let targetFile = file;

      // Handle HEIC/HEIF files
      if (isHEIC(file)) {
        try {
          targetFile = await convertHEIC(file);
        } catch (err) {
          setErrorMessage(err.message || 'HEIC conversion failed. Please upload a JPG or PNG instead.');
          setIsLoading(false);
          return;
        }
      }

      // Validate final file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(targetFile.type)) {
        setErrorMessage('Unsupported format. Please upload a JPG, PNG, or HEIC image.');
        setIsLoading(false);
        return;
      }

      // Load into HTMLImageElement
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDimension = 3000;
          let width = img.width;
          let height = img.height;
          
          if (width > maxDimension || height > maxDimension) {
            // Calculate new dimensions preserving aspect ratio
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
            
            // Perform downscale using a temporary canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Create a new image object with downscaled data
            const downscaledImg = new Image();
            downscaledImg.onload = () => {
              setIsLoading(false);
              onImageLoaded({
                file: targetFile, // keeping original file reference
                imageObj: downscaledImg,
                src: canvas.toDataURL('image/jpeg', 0.9)
              });
            };
            downscaledImg.onerror = () => {
              setIsLoading(false);
              setErrorMessage('Failed to scale down image.');
            };
            downscaledImg.src = canvas.toDataURL('image/jpeg', 0.9);
          } else {
            setIsLoading(false);
            onImageLoaded({
              file: targetFile,
              imageObj: img,
              src: event.target.result
            });
          }
        };
        img.onerror = () => {
          setIsLoading(false);
          setErrorMessage('Failed to load image. The file may be corrupted.');
        };
        img.src = event.target.result;
      };
      reader.onerror = () => {
        setIsLoading(false);
        setErrorMessage('Failed to read file. Please try again.');
      };
      reader.readAsDataURL(targetFile);

    } catch (err) {
      console.error('Upload error:', err);
      setIsLoading(false);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = (e) => {
    // Only deactivate if leaving the dropzone itself (not a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragActive(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
    // Reset input so re-selecting same file triggers onChange
    e.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-container animate-fade-in">
      <div
        className={`upload-dropzone glass-panel ${isDragActive ? 'drag-active' : ''} ${isLoading ? 'loading' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={isLoading ? undefined : triggerFileInput}
        role="button"
        tabIndex={0}
        aria-label="Upload photo — click or drag and drop"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerFileInput(); }}
      >
        {/* Hidden file input — NO capture attr, allows gallery selection on mobile */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/png, image/jpeg, image/jpg, image/heic, image/heif"
          style={{ display: 'none' }}
          aria-hidden="true"
        />

        {isLoading ? (
          <div className="upload-state">
            <div className="spinner-ring">
              <Loader className="icon-spinner" size={28} />
            </div>
            <p className="upload-title">Processing your photo…</p>
            <p className="upload-desc">Converting format and loading image data</p>
          </div>
        ) : (
          <div className="upload-state">
            <div className={`upload-icon-wrapper ${isDragActive ? 'active' : ''}`}>
              {isDragActive ? <ImageIcon size={30} /> : <Upload size={28} />}
            </div>
            <div className="upload-text-group">
              <p className="upload-title">
                {isDragActive ? 'Drop your photo here' : 'Upload your photo'}
              </p>
              <p className="upload-desc">
                Drag & drop, or{' '}
                <span className="highlight-text">browse files</span>
              </p>
              <div className="upload-format-pills">
                <span className="format-pill">JPG</span>
                <span className="format-pill">PNG</span>
                <span className="format-pill">HEIC</span>
                <span className="format-pill-sep">· Up to {MAX_FILE_SIZE_MB} MB</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="upload-error animate-fade-in" role="alert">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <style>{`
        .upload-container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .upload-dropzone {
          padding: var(--spacing-xxl) var(--spacing-lg);
          text-align: center;
          cursor: pointer;
          border: 2px dashed rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-xl);
          background: rgba(15, 17, 26, 0.5);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 260px;
          position: relative;
          overflow: hidden;
        }

        .upload-dropzone::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 60% at 50% 100%, rgba(255, 90, 95, 0.04) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .upload-dropzone:hover::before,
        .upload-dropzone.drag-active::before {
          opacity: 1;
        }

        .upload-dropzone:hover,
        .upload-dropzone.drag-active {
          border-color: rgba(255, 90, 95, 0.5);
          background: rgba(255, 90, 95, 0.03);
          box-shadow: 0 0 40px rgba(255, 90, 95, 0.08);
        }

        .upload-dropzone.loading {
          cursor: default;
          pointer-events: none;
        }

        .upload-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          position: relative;
          z-index: 1;
        }

        .upload-icon-wrapper {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          transition: all 0.3s ease;
        }

        .upload-dropzone:hover .upload-icon-wrapper,
        .upload-icon-wrapper.active {
          color: var(--color-accent-coral);
          border-color: rgba(255, 90, 95, 0.4);
          background: rgba(255, 90, 95, 0.08);
          box-shadow: 0 0 24px rgba(255, 90, 95, 0.15);
          transform: scale(1.05);
        }

        .upload-text-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .upload-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--color-text-primary);
          letter-spacing: -0.01em;
        }

        .upload-desc {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }

        .highlight-text {
          color: var(--color-accent-coral);
          font-weight: 600;
          text-decoration: underline;
          text-decoration-color: rgba(255, 90, 95, 0.4);
          text-underline-offset: 3px;
        }

        .upload-format-pills {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          margin-top: var(--spacing-xs);
          flex-wrap: wrap;
          justify-content: center;
        }

        .format-pill {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-xs);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--color-text-muted);
          letter-spacing: 0.05em;
        }

        .format-pill-sep {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--color-text-muted);
        }

        .spinner-ring {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 90, 95, 0.06);
          border: 1px solid rgba(255, 90, 95, 0.2);
        }

        .icon-spinner {
          color: var(--color-accent-coral);
          animation: spin 1.2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .upload-error {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          background: rgba(239, 68, 68, 0.07);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          padding: 12px var(--spacing-md);
          border-radius: var(--radius-md);
          margin-top: var(--spacing-md);
          font-size: 0.88rem;
          text-align: left;
          line-height: 1.5;
        }

        @media (max-width: 480px) {
          .upload-dropzone {
            min-height: 220px;
            padding: var(--spacing-xl) var(--spacing-md);
          }

          .upload-title {
            font-size: 1.05rem;
          }
        }
      `}</style>
    </div>
  );
}
