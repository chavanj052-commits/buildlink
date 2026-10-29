import React from 'react';

export default function StatusBadge({ status = 'planning', label }) {
  const normalized = String(status).toLowerCase().replace(/\s+/g, '_');

  const displayLabel = label || status.replace(/_/g, ' ');

  return (
    <span className={`status-badge status-badge--${normalized}`}>
      {displayLabel}
    </span>
  );
}
