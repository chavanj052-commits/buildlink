import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  icon: Icon,
  iconBg = 'rgba(232, 168, 56, 0.12)',
  iconColor = '#e8a838',
  value,
  label,
  trend,
  trendDirection = 'up',
}) {
  return (
    <div className="stat-card">
      <div
        className="stat-card__icon-wrapper"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-card__info">
        <div className="stat-card__value">{value ?? '—'}</div>
        <div className="stat-card__label">{label}</div>
        {trend && (
          <div
            className={`stat-card__trend ${
              trendDirection === 'up' ? 'stat-card__trend--up' : 'stat-card__trend--down'
            }`}
          >
            {trendDirection === 'up' ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}
