import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Package,
  CreditCard,
  Calendar,
  Camera,
  Plus,
  Clock,
  CheckCircle,
  MapPin,
} from 'lucide-react';
import API from '../../api';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import FileUpload from '../../components/FileUpload';
import { formatINR, formatDate, timeAgo } from '../../utils/format';

export default function ContractorDashboard() {
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Action: Request Material Modal
  const [isMatModalOpen, setIsMatModalOpen] = useState(false);
  const [matForm, setMatForm] = useState({
    name: '',
    quantity: '',
    unit: 'bags',
    rate: '',
    party: 'contractor',
    status: 'pending',
  });

  // Quick Action: Upload Photo Modal
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoTitle, setPhotoTitle] = useState('');

  const fetchContractorData = async () => {
    try {
      setLoading(true);
      const projRes = await API.get('/projects');
      const userProjects = projRes.data || [];
      const activeProj = userProjects[0] || null;
      setProject(activeProj);

      if (activeProj) {
        const [matRes, payRes] = await Promise.allSettled([
          API.get(`/materials/project/${activeProj.id}`),
          API.get(`/payments/project/${activeProj.id}`),
        ]);

        if (matRes.status === 'fulfilled') setMaterials(matRes.value.data || []);
        if (payRes.status === 'fulfilled') setPayments(payRes.value.data || []);
      }
    } catch (err) {
      console.error('Error fetching contractor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractorData();
  }, []);

  const handleRequestMaterial = async (e) => {
    e.preventDefault();
    if (!project) return;
    try {
      const { data } = await API.post(`/materials/project/${project.id}`, matForm);
      setMaterials([data, ...materials]);
      setIsMatModalOpen(false);
      setMatForm({ name: '', quantity: '', unit: 'bags', rate: '', party: 'contractor', status: 'pending' });
      alert('Material requisition sent to project manager!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit requisition');
    }
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!project || !photoFile) return;
    try {
      const fd = new FormData();
      fd.append('file', photoFile);
      fd.append('title', photoTitle || photoFile.name);
      fd.append('file_type', 'photo');

      await API.post(`/documents/project/${project.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIsPhotoModalOpen(false);
      setPhotoFile(null);
      setPhotoTitle('');
      alert('Site inspection photo uploaded successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload photo');
    }
  };

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
        <h3>No assigned site found</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          You have not been assigned to an active construction site yet. Contact your builder.
        </p>
      </div>
    );
  }

  // Contractor metrics
  const pendingMatCount = materials.filter((m) => m.status === 'pending').length;
  const contractorPendingPay = payments
    .filter((p) => p.party === 'contractor' && p.status === 'pending')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const workPhases = [
    { title: 'Reinforcement & Rebar', progress: 100 },
    { title: 'Formwork & Shuttering', progress: 85 },
    { title: 'Concrete Slab Pouring', progress: 60 },
    { title: 'Brick Masonry', progress: 30 },
  ];

  const recentContractorMaterials = materials.slice(0, 5);

  const mockUpdates = [
    { text: 'Material delivery scheduled for 8:00 AM tomorrow (Cement 50 bags)', time: new Date(Date.now() - 1000 * 60 * 50) },
    { text: 'Structural engineer approved inspection report for columns C1-C14', time: new Date(Date.now() - 1000 * 60 * 180) },
    { text: 'Labor payment voucher #482 authorized by company accounts', time: new Date(Date.now() - 1000 * 60 * 60 * 12) },
  ];

  return (
    <div className="section-gap">
      {/* Top Project Card & Quick Actions Bar */}
      <div className="card" style={{ background: '#0f1b2d', color: '#ffffff', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: 0 }}>{project.name}</h1>
              <StatusBadge status={project.status || 'active'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={14} color="#e8a838" /> {project.location || 'Site Location'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={14} color="#e8a838" /> Handover target: {formatDate(project.end_date)}
              </span>
            </div>
          </div>

          {/* Quick Action buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn--outline"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              onClick={() => setIsPhotoModalOpen(true)}
            >
              <Camera size={16} /> Upload Site Photo
            </button>
            <button
              className="btn btn--primary"
              onClick={() => setIsMatModalOpen(true)}
            >
              <Plus size={16} /> Request Material
            </button>
          </div>
        </div>
      </div>

      {/* 4 Contractor Stat Cards */}
      <div className="grid-4">
        <StatCard
          icon={CheckCircle}
          iconBg="rgba(59, 130, 246, 0.12)"
          iconColor="#3b82f6"
          value="4 Tasks"
          label="Today's On-Site Tasks"
          trend="2 ready for inspection"
          trendDirection="up"
        />
        <StatCard
          icon={Package}
          iconBg="rgba(245, 158, 11, 0.12)"
          iconColor="#f59e0b"
          value={pendingMatCount}
          label="Material Requests"
          trend={pendingMatCount > 0 ? "Pending builder approval" : "All approved"}
          trendDirection="up"
        />
        <StatCard
          icon={CreditCard}
          iconBg="rgba(34, 197, 94, 0.12)"
          iconColor="#22c55e"
          value={formatINR(contractorPendingPay)}
          label="Labor Claims Pending"
          trend="Processed on Friday"
          trendDirection="up"
        />
        <StatCard
          icon={Calendar}
          iconBg="rgba(139, 92, 246, 0.12)"
          iconColor="#8b5cf6"
          value={formatDate(project.end_date)}
          label="Next Milestone Deadline"
          trend="Roof Slab Inspection"
          trendDirection="up"
        />
      </div>

      {/* My Work Progress Section */}
      <div className="card">
        <div className="card__header">
          <div>
            <h3 className="card__title">Site Work Execution Progress</h3>
            <p className="card__subtitle">Field progress benchmarks by active trade teams</p>
          </div>
        </div>

        <div className="grid-2">
          {workPhases.map((phase, idx) => (
            <div key={idx} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                <span>{phase.title}</span>
                <span style={{ color: 'var(--accent-hover)' }}>{phase.progress}%</span>
              </div>
              <ProgressBar progress={phase.progress} showLabel={false} height={6} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom 2 Sections: Recent Materials & Recent Updates */}
      <div className="grid-2">
        {/* Recent Materials Table */}
        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Recent Material Orders</h3>
              <p className="card__subtitle">Materials requested for site operations</p>
            </div>
            <Link to="/materials" className="card__action">
              View All
            </Link>
          </div>

          {recentContractorMaterials.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContractorMaterials.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td>{m.quantity} {m.unit || 'units'}</td>
                      <td><StatusBadge status={m.status || 'pending'} /></td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {formatDate(m.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No material orders logged yet.
            </div>
          )}
        </div>

        {/* Recent Site Updates */}
        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Site Activity & Instructions</h3>
              <p className="card__subtitle">Direct communication from project supervisor</p>
            </div>
          </div>

          <div className="activity-feed">
            {mockUpdates.map((u, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-dot activity-dot--gold" />
                <div className="activity-content">
                  <div className="activity-text">{u.text}</div>
                  <div className="activity-time">{timeAgo(u.time)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Request Material Modal */}
      <Modal
        isOpen={isMatModalOpen}
        onClose={() => setIsMatModalOpen(false)}
        title="Request Site Materials"
        size="md"
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => setIsMatModalOpen(false)}>Cancel</button>
            <button type="submit" form="contractor-mat-form" className="btn btn--primary">Submit Request</button>
          </>
        }
      >
        <form id="contractor-mat-form" onSubmit={handleRequestMaterial}>
          <div className="form-group">
            <label className="form-label">Material Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Ready-Mix Concrete M25"
              value={matForm.name}
              onChange={(e) => setMatForm({ ...matForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Quantity Needed *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 15"
                value={matForm.quantity}
                onChange={(e) => setMatForm({ ...matForm, quantity: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select
                className="form-select"
                value={matForm.unit}
                onChange={(e) => setMatForm({ ...matForm, unit: e.target.value })}
              >
                <option value="bags">Bags</option>
                <option value="loads">Truck Loads / m³</option>
                <option value="tons">Tons</option>
                <option value="units">Pieces / Units</option>
                <option value="litres">Litres</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Upload Photo Modal */}
      <Modal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        title="Upload Site Progress Photo"
        size="md"
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => setIsPhotoModalOpen(false)}>Cancel</button>
            <button
              type="submit"
              form="photo-upload-form"
              className="btn btn--primary"
              disabled={!photoFile}
            >
              Upload Photo
            </button>
          </>
        }
      >
        <form id="photo-upload-form" onSubmit={handleUploadPhoto}>
          <div className="form-group">
            <label className="form-label">Photo Description / Location Tag</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Column C3 Rebar Tying Complete"
              value={photoTitle}
              onChange={(e) => setPhotoTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Capture / Photo Asset</label>
            <FileUpload
              selectedFile={photoFile}
              onFileSelect={setPhotoFile}
              onClear={() => setPhotoFile(null)}
              label="Select or take site photo"
              hint="JPG, PNG from field mobile device"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
