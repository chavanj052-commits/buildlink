import React from 'react';

export default function ProgressBar({
  progress = 0,
  showLabel = true,
  title,
  variant = 'primary',
  height = 8,
}) {
  const clamped = Math.min(100, Math.max(0, Number(progress) || 0));

  return (
    <div className="progress-bar">
      {(title || showLabel) && (
        <div className="progress-bar__header">
          {title && <span className="progress-bar__title">{title}</span>}
          {showLabel && (
            <span className="progress-bar__percentage">{clamped}%</span>
          )}
        </div>
      )}
      <div className="progress-bar__track" style={{ height: `${height}px` }}>
        <div
          className={`progress-bar__fill progress-bar__fill--${variant}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
