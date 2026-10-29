import React from 'react';
import { MapPin, User, HardHat, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { formatINR, formatDate } from '../utils/format';

export default function ProjectCard({ project, onClick }) {
  if (!project) return null;

  const {
    name = 'Untitled Project',
    location = 'Location pending',
    status = 'planning',
    progress = 0,
    budget = 0,
    start_date,
    end_date,
    homeowner_name,
    contractor_name,
    image_url,
  } = project;

  return (
    <div className="project-card" onClick={onClick}>
      <div
        className="project-card__banner"
        style={image_url ? { backgroundImage: `url(${image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        <div className="project-card__banner-pattern" />
        <div className="project-card__badge-wrapper">
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="project-card__body">
        <div>
          <h3 className="project-card__title">{name}</h3>
          <div className="project-card__location">
            <MapPin size={14} color="#e8a838" />
            <span>{location}</span>
          </div>
        </div>

        <ProgressBar progress={progress} title="Completion" />

        <div className="project-card__meta-grid">
          <div className="project-card__meta-item">
            <span className="project-card__meta-label">Budget</span>
            <span className="project-card__meta-val" style={{ color: 'var(--accent-hover)' }}>
              {formatINR(budget)}
            </span>
          </div>
          <div className="project-card__meta-item">
            <span className="project-card__meta-label">Target Completion</span>
            <span className="project-card__meta-val">
              {formatDate(end_date)}
            </span>
          </div>
        </div>

        <div className="project-card__footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <User size={13} color="#8899aa" />
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {homeowner_name || 'Client Unassigned'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <HardHat size={13} color="#8899aa" />
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {contractor_name || 'Contractor Unassigned'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
