import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Search, Filter, CheckCircle2, Clock } from 'lucide-react';
import API from '../../api';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { formatINR, formatDate } from '../../utils/format';

export default function CompanyPayments() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterParty, setFilterParty] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    payment_type: 'milestone',
    party: 'homeowner',
    status: 'pending',
    description: '',
    stage: 'Slab Casting',
    received_by: '',
    payment_date: new Date().toISOString().split('T')[0],
  });

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProjectId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchPayments = async (projId) => {
    if (!projId) return;
    try {
      setLoading(true);
      const { data } = await API.get(`/payments/project/${projId}`);
      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchPayments(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post(`/payments/project/${selectedProjectId}`, form);
      setPayments([data, ...payments]);
      setIsModalOpen(false);
      setForm({
        amount: '',
        payment_type: 'milestone',
        party: 'homeowner',
        status: 'pending',
        description: '',
        stage: 'Structure',
        received_by: '',
        payment_date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create payment record');
    }
  };

  const handleUpdateStatus = async (paymentId, newStatus) => {
    try {
      const { data } = await API.put(`/payments/${paymentId}`, { status: newStatus });
      setPayments(payments.map((p) => (p.id === paymentId ? { ...p, status: newStatus } : p)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status');
    }
  };

  const totalInvoiced = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      (p.stage && p.stage.toLowerCase().includes(search.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesParty = filterParty === 'all' || p.party === filterParty;
    return matchesSearch && matchesParty;
  });

  return (
    <div className="section-gap">
      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontWeight: 600, fontSize: '13.5px' }}>Project:</label>
          <select
            className="form-select"
            style={{ width: '260px' }}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn--primary" onClick={() => setIsModalOpen(true)} disabled={!selectedProjectId}>
          <Plus size={16} /> Record Payment / Invoice
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid-3">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(232, 168, 56, 0.15)', color: '#e8a838', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Invoiced</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{formatINR(totalInvoiced)}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Settled / Paid</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--success)' }}>{formatINR(totalPaid)}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Escrow</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b' }}>{formatINR(totalPending)}</div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '34px', height: '36px' }}
              placeholder="Search stage or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: '160px', height: '36px' }}
            value={filterParty}
            onChange={(e) => setFilterParty(e.target.value)}
          >
            <option value="all">All Parties</option>
            <option value="homeowner">Homeowner Payments</option>
            <option value="contractor">Contractor Disbursements</option>
          </select>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#e8a838', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filteredPayments.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Milestone / Stage</th>
                  <th>Amount</th>
                  <th>Party</th>
                  <th>Type</th>
                  <th>Payment Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.stage || 'Milestone'}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{p.description}</div>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--accent-hover)' }}>
                      {formatINR(p.amount)}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: p.party === 'homeowner' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(232, 168, 56, 0.12)', color: p.party === 'homeowner' ? '#3b82f6' : '#d97706', fontWeight: 600 }}>
                        {p.party || 'homeowner'}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{p.payment_type || 'Milestone'}</td>
                    <td>{formatDate(p.payment_date || p.created_at)}</td>
                    <td><StatusBadge status={p.status || 'pending'} /></td>
                    <td style={{ textAlign: 'right' }}>
                      {p.status === 'pending' && (
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn--outline btn--sm"
                            style={{ color: 'var(--success)' }}
                            onClick={() => handleUpdateStatus(p.id, 'paid')}
                          >
                            Mark Paid
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No payment transactions recorded for this project yet.
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Financial Transaction"
        size="md"
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" form="record-pay-form" className="btn btn--primary">Save Payment</button>
          </>
        }
      >
        <form id="record-pay-form" onSubmit={handleCreatePayment}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Amount (INR ₹) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 500000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Milestone / Stage Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Roof Slab Completion"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Party</label>
              <select
                className="form-select"
                value={form.party}
                onChange={(e) => setForm({ ...form, party: e.target.value })}
              >
                <option value="homeowner">Homeowner (Inbound Payment)</option>
                <option value="contractor">Contractor (Outbound Labor)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Mode / Type</label>
              <select
                className="form-select"
                value={form.payment_type}
                onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
              >
                <option value="milestone">Milestone Disbursement</option>
                <option value="advance">Mobilization Advance</option>
                <option value="material">Material Cost Reimbursement</option>
                <option value="retention">Retention Release</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Payment Date</label>
              <input
                type="date"
                className="form-input"
                value={form.payment_date}
                onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid / Settled</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Cheque or NEFT Reference</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. UTR / NEFT reference number or bank verification notes..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
