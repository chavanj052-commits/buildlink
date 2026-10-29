import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, ShieldCheck, Download } from 'lucide-react';
import API from '../../api';
import StatusBadge from '../../components/StatusBadge';
import { formatINR, formatDate } from '../../utils/format';

export default function HomeownerPayments() {
  const [project, setProject] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const projRes = await API.get('/projects');
        const userProjects = projRes.data || [];
        const activeProj = userProjects[0] || null;
        setProject(activeProj);

        if (activeProj) {
          const payRes = await API.get(`/payments/project/${activeProj.id}`);
          // Only show homeowner party payments
          const filtered = (payRes.data || []).filter((p) => p.party === 'homeowner');
          setPayments(filtered);
        }
      } catch (err) {
        console.error('Error fetching homeowner payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const handlePay = async (paymentId) => {
    if (!window.confirm('Confirm milestone disbursement to escrow?')) return;
    try {
      await API.put(`/payments/${paymentId}`, { status: 'paid' });
      setPayments(payments.map((p) => (p.id === paymentId ? { ...p, status: 'paid' } : p)));
      alert('Payment disbursed successfully into escrow!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process payment');
    }
  };

  return (
    <div className="section-gap">
      {/* Financial Summary */}
      <div className="grid-3">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Agreed Budget</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatINR(project?.budget || 0)}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Disbursed</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--success)' }}>
              {formatINR(totalPaid)}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(232, 168, 56, 0.15)', color: '#e8a838', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Invoices</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-hover)' }}>
              {formatINR(totalPending)}
            </div>
          </div>
        </div>
      </div>

      {/* Escrow guarantee notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: 'var(--radius-md)' }}>
        <ShieldCheck size={22} color="var(--success)" />
        <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
          <strong>BuildLink Escrow Protection:</strong> Funds are only released to the construction firm upon verified completion of each structural milestone.
        </span>
      </div>

      {/* Payment Milestones Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card__header" style={{ padding: '20px 24px 16px', margin: 0, borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <h3 className="card__title">Milestone Payment Schedule</h3>
            <p className="card__subtitle">Scheduled disbursements tied to physical completion</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#e8a838', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : payments.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Milestone Stage</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.stage || 'Milestone Stage'}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{p.description}</div>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '14px', color: 'var(--accent-hover)' }}>
                      {formatINR(p.amount)}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{p.payment_type || 'Milestone'}</td>
                    <td>{formatDate(p.payment_date || p.created_at)}</td>
                    <td><StatusBadge status={p.status || 'pending'} /></td>
                    <td style={{ textAlign: 'right' }}>
                      {p.status === 'pending' ? (
                        <button
                          className="btn btn--primary btn--sm"
                          onClick={() => handlePay(p.id)}
                        >
                          Disburse Funds
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>
                          ✓ Disbursed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No payment milestones configured yet for your project.
          </div>
        )}
      </div>
    </div>
  );
}
