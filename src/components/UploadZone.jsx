import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, AlertCircle, Loader } from 'lucide-react';
import { isHEIC, convertHEIC } from '../lib/image-processing/heicConverter';

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
      let targetFile = file;

      // Handle HEIC/HEIF files
      if (isHEIC(file)) {
        try {
          targetFile = await convertHEIC(file);
        } catch (err) {
          setErrorMessage(err.message || 'HEIC conversion failed.');
          setIsLoading(false);
          return;
        }
      }

      // Check file types (PNG or JPG/JPEG)
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(targetFile.type)) {
        setErrorMessage('Unsupported format. Please upload a JPG or PNG image.');
        setIsLoading(false);
        return;
      }

      // Load file into an Image object
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setIsLoading(false);
          onImageLoaded({
            file: targetFile,
            imageObj: img,
            src: event.target.result
          });
        };
        img.onerror = () => {
          setIsLoading(false);
          setErrorMessage('Failed to load image. File may be corrupted.');
        };
        img.src = event.target.result;
      };
      reader.onerror = () => {
        setIsLoading(false);
        setErrorMessage('Failed to read file.');
      };
      reader.readAsDataURL(targetFile);

    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setErrorMessage('An unexpected error occurred during upload.');
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-container animate-fade-in">
      <div 
        className={`upload-dropzone glass-panel ${isDragActive ? 'drag-active' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={triggerFileInput}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/png, image/jpeg, image/jpg, image/heic, image/heif"
          style={{ display: 'none' }}
          capture="user" // support mobile camera directly
        />

        {isLoading ? (
          <div className="upload-state">
            <Loader className="icon-spinner" size={48} />
            <p className="upload-title">Processing file...</p>
            <p className="upload-desc">Converting format and loading image data</p>
          </div>
        ) : (
          <div className="upload-state">
            <div className="upload-icon-wrapper">
              <Upload size={32} />
            </div>
            <p className="upload-title">Upload your profile image</p>
            <p className="upload-desc">
              Drag & drop here, or <span className="highlight-text">browse files</span>
            </p>
            <p className="upload-formats">Supports JPG, PNG, and HEIC files</p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="upload-error animate-fade-in">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Styled inline scoped components */}
      <style>{`
        .upload-container {
          width: 100%;
          max-width: 580px;
          margin: 0 auto;
        }

        .upload-dropzone {
          padding: var(--spacing-xxl) var(--spacing-lg);
          text-align: center;
          cursor: pointer;
          border: 2px dashed rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-lg);
          background: rgba(18, 20, 30, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 240px;
        }

        .upload-dropzone:hover, .upload-dropzone.drag-active {
          border-color: var(--color-accent-coral);
          background: rgba(255, 90, 95, 0.04);
          box-shadow: 0 0 30px rgba(255, 90, 95, 0.1);
        }

        .upload-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
        }

        .upload-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          margin-bottom: var(--spacing-sm);
          transition: all 0.3s ease;
        }

        .upload-dropzone:hover .upload-icon-wrapper {
          color: var(--color-accent-coral);
          border-color: rgba(255, 90, 95, 0.3);
          background: rgba(255, 90, 95, 0.1);
        }

        .upload-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .upload-desc {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
        }

        .highlight-text {
          color: var(--color-accent-coral);
          font-weight: 600;
          text-decoration: underline;
        }

        .upload-formats {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-top: var(--spacing-xs);
        }

        .upload-error {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #EF4444;
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          margin-top: var(--spacing-md);
          font-size: 0.9rem;
          text-align: left;
          line-height: 1.4;
        }

        .icon-spinner {
          color: var(--color-accent-coral);
          animation: spin 1.5s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
