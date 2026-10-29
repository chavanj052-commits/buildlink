import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  DollarSign,
  User,
  HardHat,
  ArrowLeft,
  Package,
  CreditCard,
  FileText,
  MessageSquare,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import API from '../../api';
import StatusBadge from '../../components/StatusBadge';
import ProgressBar from '../../components/ProgressBar';
import BudgetBar from '../../components/BudgetBar';
import Modal from '../../components/Modal';
import FileUpload from '../../components/FileUpload';
import { formatINR, formatDate } from '../../utils/format';

export default function CompanyProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, materials, payments, documents

  // Material Modal
  const [isMatModalOpen, setIsMatModalOpen] = useState(false);
  const [matForm, setMatForm] = useState({
    name: '',
    quantity: '',
    unit: 'bags',
    rate: '',
    party: 'contractor',
    status: 'pending',
  });

  // Payment Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payForm, setPayForm] = useState({
    amount: '',
    payment_type: 'milestone',
    party: 'homeowner',
    status: 'pending',
    description: '',
    stage: 'Foundation',
    received_by: '',
    payment_date: new Date().toISOString().split('T')[0],
  });

  // Document Upload Modal
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('blueprint');

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projRes, matRes, payRes, docRes] = await Promise.allSettled([
        API.get(`/projects/${id}`),
        API.get(`/materials/project/${id}`),
        API.get(`/payments/project/${id}`),
        API.get(`/documents/project/${id}`),
      ]);

      if (projRes.status === 'fulfilled') setProject(projRes.value.data);
      if (matRes.status === 'fulfilled') setMaterials(matRes.value.data || []);
      if (payRes.status === 'fulfilled') setPayments(payRes.value.data || []);
      if (docRes.status === 'fulfilled') setDocuments(docRes.value.data || []);
    } catch (err) {
      console.error('Error fetching project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post(`/materials/project/${id}`, matForm);
      setMaterials([data, ...materials]);
      setIsMatModalOpen(false);
      setMatForm({ name: '', quantity: '', unit: 'bags', rate: '', party: 'contractor', status: 'pending' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add material');
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post(`/payments/project/${id}`, payForm);
      setPayments([data, ...payments]);
      setIsPayModalOpen(false);
      setPayForm({
        amount: '',
        payment_type: 'milestone',
        party: 'homeowner',
        status: 'pending',
        description: '',
        stage: 'Foundation',
        received_by: '',
        payment_date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('title', docTitle || selectedFile.name);
      fd.append('file_type', docCategory);

      const { data } = await API.post(`/documents/project/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDocuments([data, ...documents]);
      setIsDocModalOpen(false);
      setSelectedFile(null);
      setDocTitle('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload document');
    }
  };

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
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h3>Project not found</h3>
        <button className="btn btn--primary" style={{ marginTop: '16px' }} onClick={() => navigate('/projects')}>
          Back to Projects
        </button>
      </div>
    );
  }

  const totalSpent = payments
    .filter((p) => p.status === 'paid' || p.status === 'approved')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="section-gap">
      {/* Back button & Hero Header */}
      <div>
        <button
          onClick={() => navigate('/projects')}
          className="btn btn--outline btn--sm"
          style={{ marginBottom: '16px' }}
        >
          <ArrowLeft size={14} /> Back to Projects
        </button>

        <div className="card" style={{ background: '#0f1b2d', color: '#ffffff', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {project.name}
                </h1>
                <StatusBadge status={project.status || 'planning'} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: '#94a3b8', fontSize: '13px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#e8a838" /> {project.location || 'Location not specified'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="#e8a838" /> {formatDate(project.start_date)} — {formatDate(project.end_date)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={14} color="#e8a838" /> Budget: <strong style={{ color: '#ffffff' }}>{formatINR(project.budget)}</strong>
                </span>
              </div>
            </div>

            <div style={{ width: '220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Overall Completion</span>
                <span style={{ fontWeight: 700, color: '#e8a838' }}>{project.progress || 0}%</span>
              </div>
              <ProgressBar progress={project.progress || 0} showLabel={false} height={8} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '2px' }}>
        {[
          { id: 'overview', label: 'Project Overview', icon: FileText },
          { id: 'materials', label: `Materials (${materials.length})`, icon: Package },
          { id: 'payments', label: `Payments & Escrow (${payments.length})`, icon: CreditCard },
          { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderBottom: active ? '3px solid #e8a838' : '3px solid transparent',
                color: active ? '#0f1b2d' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500,
                fontSize: '13.5px',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              <Icon size={16} color={active ? '#e8a838' : 'currentColor'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="section-gap">
          <div className="grid-2">
            <div className="card">
              <h3 className="card__title" style={{ marginBottom: '16px' }}>Project Capital Liquidity</h3>
              <BudgetBar totalBudget={project.budget} spentAmount={totalSpent} />
            </div>

            <div className="card">
              <h3 className="card__title" style={{ marginBottom: '16px' }}>Assigned Project Parties</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Homeowner / Client</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                      {project.homeowner_name || 'No homeowner assigned'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(232, 168, 56, 0.15)', color: '#e8a838', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HardHat size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Lead Contractor / Trade</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                      {project.contractor_name || 'No contractor assigned'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card__title" style={{ marginBottom: '12px' }}>Scope & Architectural Description</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {project.description || 'No detailed architectural description entered for this project.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Materials */}
      {activeTab === 'materials' && (
        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Project Materials Log</h3>
              <p className="card__subtitle">Procurement records and bill-of-materials</p>
            </div>
            <button className="btn btn--primary btn--sm" onClick={() => setIsMatModalOpen(true)}>
              <Plus size={14} /> Add Material
            </button>
          </div>

          {materials.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Material Item</th>
                    <th>Quantity</th>
                    <th>Unit Rate</th>
                    <th>Total Cost</th>
                    <th>Party</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td>{m.quantity} {m.unit || 'units'}</td>
                      <td>{formatINR(m.rate)}</td>
                      <td style={{ fontWeight: 700 }}>{formatINR((m.quantity || 0) * (m.rate || 0))}</td>
                      <td style={{ textTransform: 'capitalize' }}>{m.party || 'contractor'}</td>
                      <td><StatusBadge status={m.status || 'pending'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
              No material logs recorded for this project yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Payments */}
      {activeTab === 'payments' && (
        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Financial Disbursements & Milestones</h3>
              <p className="card__subtitle">Homeowner invoices and contractor labor payments</p>
            </div>
            <button className="btn btn--primary btn--sm" onClick={() => setIsPayModalOpen(true)}>
              <Plus size={14} /> Record Payment
            </button>
          </div>

          {payments.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Stage / Purpose</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Party</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.stage || 'Milestone'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.description}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-hover)' }}>{formatINR(p.amount)}</td>
                      <td style={{ textTransform: 'capitalize' }}>{p.payment_type || 'Milestone'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{p.party || 'Homeowner'}</td>
                      <td>{formatDate(p.payment_date || p.created_at)}</td>
                      <td><StatusBadge status={p.status || 'pending'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
              No payments recorded yet for this project.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Documents */}
      {activeTab === 'documents' && (
        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Project Documents & Drawings</h3>
              <p className="card__subtitle">Blueprints, permits, CAD sheets, and photo logs</p>
            </div>
            <button className="btn btn--primary btn--sm" onClick={() => setIsDocModalOpen(true)}>
              <Plus size={14} /> Upload File
            </button>
          </div>

          {documents.length > 0 ? (
            <div className="grid-3">
              {documents.map((d) => (
                <div key={d.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(232, 168, 56, 0.15)', color: '#e8a838', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {d.title || d.file_name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        {d.file_type || 'Document'}
                      </div>
                    </div>
                  </div>
                  {d.file_url && (
                    <a
                      href={d.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn--outline btn--sm"
                      style={{ marginTop: '8px', width: '100%' }}
                    >
                      <ExternalLink size={13} /> View File
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
              No documents or site photos uploaded yet.
            </div>
          )}
        </div>
      )}

      {/* Material Modal */}
      <Modal
        isOpen={isMatModalOpen}
        onClose={() => setIsMatModalOpen(false)}
        title="Add Material Requisition"
        size="md"
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => setIsMatModalOpen(false)}>Cancel</button>
            <button type="submit" form="mat-form" className="btn btn--primary">Save Item</button>
          </>
        }
      >
        <form id="mat-form" onSubmit={handleAddMaterial}>
          <div className="form-group">
            <label className="form-label">Material Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. TMT Steel Bars (12mm)"
              value={matForm.name}
              onChange={(e) => setMatForm({ ...matForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 50"
                value={matForm.quantity}
                onChange={(e) => setMatForm({ ...matForm, quantity: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <select
                className="form-select"
                value={matForm.unit}
                onChange={(e) => setMatForm({ ...matForm, unit: e.target.value })}
              >
                <option value="bags">Bags</option>
                <option value="tons">Tons</option>
                <option value="sqft">Sq Ft</option>
                <option value="units">Units / Pieces</option>
                <option value="litres">Litres</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Unit Rate (INR ₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 420"
                value={matForm.rate}
                onChange={(e) => setMatForm({ ...matForm, rate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Allocated Party</label>
              <select
                className="form-select"
                value={matForm.party}
                onChange={(e) => setMatForm({ ...matForm, party: e.target.value })}
              >
                <option value="contractor">Contractor Side</option>
                <option value="homeowner">Homeowner Side</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Record Project Payment"
        size="md"
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => setIsPayModalOpen(false)}>Cancel</button>
            <button type="submit" form="pay-form" className="btn btn--primary">Record Payment</button>
          </>
        }
      >
        <form id="pay-form" onSubmit={handleAddPayment}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Amount (INR ₹) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 250000"
                value={payForm.amount}
                onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Construction Stage</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Foundation / Structure"
                value={payForm.stage}
                onChange={(e) => setPayForm({ ...payForm, stage: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Party</label>
              <select
                className="form-select"
                value={payForm.party}
                onChange={(e) => setPayForm({ ...payForm, party: e.target.value })}
              >
                <option value="homeowner">Homeowner</option>
                <option value="contractor">Contractor</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={payForm.status}
                onChange={(e) => setPayForm({ ...payForm, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Description</label>
            <textarea
              className="form-textarea"
              placeholder="Milestone verification notes or cheque / transaction ID..."
              value={payForm.description}
              onChange={(e) => setPayForm({ ...payForm, description: e.target.value })}
              rows={2}
            />
          </div>
        </form>
      </Modal>

      {/* Document Modal */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Upload Document / Drawing"
        size="md"
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => setIsDocModalOpen(false)}>Cancel</button>
            <button
              type="submit"
              form="doc-form"
              className="btn btn--primary"
              disabled={!selectedFile}
            >
              Upload
            </button>
          </>
        }
      >
        <form id="doc-form" onSubmit={handleUploadDocument}>
          <div className="form-group">
            <label className="form-label">Document Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Ground Floor Electrical Layout"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
            >
              <option value="blueprint">Blueprint / Architectural Plan</option>
              <option value="permit">Government Permit / Approval</option>
              <option value="photo">Site Progress Photo</option>
              <option value="contract">Agreement / Contract</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Choose File</label>
            <FileUpload
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              onClear={() => setSelectedFile(null)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
