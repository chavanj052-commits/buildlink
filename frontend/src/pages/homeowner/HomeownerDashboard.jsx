import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  CreditCard,
  DollarSign,
  Camera,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import API from '../../api';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import { formatINR, formatDate, timeAgo } from '../../utils/format';

export default function HomeownerDashboard() {
  const [project, setProject] = useState(null);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeownerData = async () => {
      try {
        setLoading(true);
        // Homeowner gets their assigned project(s)
        const projRes = await API.get('/projects');
        const userProjects = projRes.data || [];
        const activeProj = userProjects[0] || null;
        setProject(activeProj);

        if (activeProj) {
          const [payRes, docRes] = await Promise.allSettled([
            API.get(`/payments/project/${activeProj.id}`),
            API.get(`/documents/project/${activeProj.id}`),
          ]);

          if (payRes.status === 'fulfilled') setPayments(payRes.value.data || []);
          if (docRes.status === 'fulfilled') setDocuments(docRes.value.data || []);
        }
      } catch (err) {
        console.error('Error fetching homeowner dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeownerData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#e8a838',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3>No project assigned yet</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Your builder has not linked a construction venture to your account yet. Contact your project manager.
        </p>
      </div>
    );
  }

  // Calculate financial statistics for homeowner (NO contractor costs or company margins)
  const totalBudget = Number(project.budget) || 0;
  const spentAmount = payments
    .filter((p) => p.status === 'paid' && p.party === 'homeowner')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const spentPercent = totalBudget > 0 ? Math.round((spentAmount / totalBudget) * 100) : 0;
  const remainingBudget = Math.max(0, totalBudget - spentAmount);

  // Construction phases timeline
  const currentProgress = project.progress || 35;
  const phases = [
    { name: 'Foundation', completion: 100 },
    { name: 'Structure', completion: Math.min(100, Math.max(0, (currentProgress - 20) * 2.5)) },
    { name: 'Plumbing & Elec', completion: Math.min(100, Math.max(0, (currentProgress - 50) * 3)) },
    { name: 'Interior', completion: Math.min(100, Math.max(0, (currentProgress - 75) * 4)) },
    { name: 'Final Handover', completion: currentProgress >= 100 ? 100 : 0 },
  ];

  // Site photos from documents
  const sitePhotos = documents.filter((d) => d.file_type === 'photo');

  const updates = [
    { text: 'Second floor slab casting passed quality assurance check', time: new Date(Date.now() - 1000 * 60 * 60 * 3) },
    { text: 'Conduit piping and electrical wiring approved by site inspector', time: new Date(Date.now() - 1000 * 60 * 60 * 22) },
    { text: 'Milestone payment #2 invoice verified and settled in escrow', time: new Date(Date.now() - 1000 * 60 * 60 * 48) },
    { text: 'Exterior brick masonry commenced on north wing', time: new Date(Date.now() - 1000 * 60 * 60 * 72) },
  ];

  return (
    <div className="section-gap">
      {/* Top Project Hero Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f1b2d 0%, #1a2740 100%)',
          color: '#ffffff',
          padding: '32px',
          position: 'relative',
          overflow: 'hidden',
          border: 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 2 }}>
          <div>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.08em' }}>
              My Construction Home
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', margin: '4px 0 10px' }}>
              {project.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#94a3b8', fontSize: '13.5px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} color="#e8a838" /> {project.location || 'Bangalore, India'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} color="#e8a838" /> Started: {formatDate(project.start_date)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} color="#e8a838" /> Expected Handover: {formatDate(project.end_date)}
              </span>
            </div>
          </div>

          {/* Progress circle metric */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.06)', padding: '16px 24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Overall Construction</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#e8a838', lineHeight: 1.1 }}>
                {currentProgress}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--success)' }}>On Schedule</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid-4">
        <StatCard
          icon={DollarSign}
          iconBg="rgba(59, 130, 246, 0.12)"
          iconColor="#3b82f6"
          value={formatINR(totalBudget)}
          label="Total Budget"
          trend="Approved Contract"
          trendDirection="up"
        />
        <StatCard
          icon={CreditCard}
          iconBg="rgba(232, 168, 56, 0.15)"
          iconColor="#e8a838"
          value={formatINR(spentAmount)}
          label="Amount Disbursed"
          trend={`${spentPercent}% of total`}
          trendDirection="up"
        />
        <StatCard
          icon={CheckCircle2}
          iconBg="rgba(34, 197, 94, 0.12)"
          iconColor="#22c55e"
          value={formatINR(remainingBudget)}
          label="Remaining Balance"
          trend="Escrow Protected"
          trendDirection="up"
        />
        <StatCard
          icon={Clock}
          iconBg="rgba(139, 92, 246, 0.12)"
          iconColor="#8b5cf6"
          value="Plumbing & Elec"
          label="Current Phase"
          trend="Next: Interior Plastering"
          trendDirection="up"
        />
      </div>

      {/* Construction Progress Horizontal Timeline */}
      <div className="card">
        <div className="card__header">
          <div>
            <h3 className="card__title">Construction Milestones</h3>
            <p className="card__subtitle">Phased execution tracking by chief engineer</p>
          </div>
        </div>

        <div className="timeline-phases" style={{ overflowX: 'auto', padding: '24px 12px' }}>
          {phases.map((phase, idx) => {
            const isCompleted = phase.completion >= 100;
            const isActive = phase.completion > 0 && phase.completion < 100;
            return (
              <div
                key={idx}
                className={`timeline-phase-node ${
                  isCompleted
                    ? 'timeline-phase-node--completed'
                    : isActive
                    ? 'timeline-phase-node--active'
                    : ''
                }`}
              >
                <div className="timeline-phase-circle">
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div className="timeline-phase-title">{phase.name}</div>
                <div className="timeline-phase-percent">
                  {Math.round(phase.completion)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom 2 Cards: Site Photos & Updates */}
      <div className="grid-2">
        {/* Recent Site Photos */}
        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Recent Site Photos</h3>
              <p className="card__subtitle">Live ground verification from site engineers</p>
            </div>
            <Link to="/documents" className="card__action">
              View All Photos <ArrowRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </div>

          {sitePhotos.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {sitePhotos.slice(0, 6).map((photo) => (
                <div
                  key={photo.id}
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    height: '110px',
                    position: 'relative',
                    background: '#1e293b',
                  }}
                >
                  {photo.file_url ? (
                    <img
                      src={photo.file_url}
                      alt={photo.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                      <Camera size={24} />
                    </div>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      color: '#ffffff',
                      fontSize: '11px',
                      padding: '4px 8px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {photo.title || 'Site Capture'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
              <Camera size={36} style={{ color: '#cbd5e1', margin: '0 auto 10px' }} />
              <p style={{ fontSize: '13px' }}>No site inspection photos uploaded yet.</p>
            </div>
          )}
        </div>

        {/* Recent Updates */}
        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Recent Project Updates</h3>
              <p className="card__subtitle">Progress notices from your building team</p>
            </div>
          </div>

          <div className="activity-feed">
            {updates.map((u, i) => (
              <div key={i} className="activity-item">
                <div className="activity-dot activity-dot--green" />
                <div className="activity-content">
                  <div className="activity-text">{u.text}</div>
                  <div className="activity-time">{timeAgo(u.time)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
