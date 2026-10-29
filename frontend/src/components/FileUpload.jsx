import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, X } from 'lucide-react';

export default function FileUpload({
  onFileSelect,
  accept = '*/*',
  label = 'Upload document or site photo',
  hint = 'PDF, PNG, JPG, CAD up to 25MB',
  selectedFile,
  onClear,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {selectedFile ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(34, 197, 94, 0.12)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedFile.name}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                {formatFileSize(selectedFile.size)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (inputRef.current) inputRef.current.value = '';
              if (onClear) onClear();
            }}
            className="btn btn--outline btn--sm"
          >
            <X size={14} /> Remove
          </button>
        </div>
      ) : (
        <div
          className={`file-upload ${isDragging ? 'file-upload--dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className="file-upload__icon" />
          <div className="file-upload__title">{label}</div>
          <div className="file-upload__sub">{hint}</div>
        </div>
      )}
    </div>
  );
}
