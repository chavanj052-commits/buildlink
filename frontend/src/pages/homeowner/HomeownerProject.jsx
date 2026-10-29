import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, HardHat, FileText, CheckCircle2 } from 'lucide-react';
import API from '../../api';
import ProgressBar from '../../components/ProgressBar';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/format';

export default function HomeownerProject() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/projects');
        setProject(data && data.length > 0 ? data[0] : null);
      } catch (err) {
        console.error('Error fetching homeowner project:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#e8a838', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3>No active project found</h3>
      </div>
    );
  }

  return (
    <div className="section-gap">
      {/* Project Overview Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {project.name}
              </h2>
              <StatusBadge status={project.status || 'planning'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={14} color="#e8a838" /> {project.location || 'Location Pending'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={14} color="#e8a838" /> Started {formatDate(project.start_date)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={14} color="#e8a838" /> Target: {formatDate(project.end_date)}
              </span>
            </div>
          </div>

          <div style={{ width: '200px' }}>
            <ProgressBar progress={project.progress || 0} title="Overall Progress" height={8} />
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '20px', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Architectural Scope & Details</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.6 }}>
            {project.description || 'Custom residential villa constructed with high-grade RCC frame, earthquake-resistant design, and premium architectural finishes.'}
          </p>
        </div>
      </div>

      {/* Contractor Details */}
      <div className="card">
        <h3 className="card__title" style={{ marginBottom: '16px' }}>Your Assigned Construction Lead</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(232, 168, 56, 0.15)', color: '#e8a838', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardHat size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>
              {project.contractor_name || 'Assigned Lead Contractor'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Licensed Master Contractor • Verified BuildLink Partner
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
