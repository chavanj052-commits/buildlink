import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock } from 'lucide-react';
import API from '../../api';
import StatusBadge from '../../components/StatusBadge';
import { formatINR, formatDate } from '../../utils/format';

export default function ContractorPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const projRes = await API.get('/projects');
        const activeProj = projRes.data && projRes.data.length > 0 ? projRes.data[0] : null;

        if (activeProj) {
          const payRes = await API.get(`/payments/project/${activeProj.id}`);
          // Backend role filtering or filter by contractor party
          const filtered = (payRes.data || []).filter((p) => p.party === 'contractor');
          setPayments(filtered);
        }
      } catch (err) {
        console.error('Error fetching contractor payments:', err);
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

  return (
    <div className="section-gap">
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Labor Disbursements & Claims</h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Direct disbursements for work stages, trade labor, and site contractor vouchers
        </p>
      </div>

      <div className="grid-2">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Disbursed to Trade</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--success)' }}>{formatINR(totalPaid)}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(232, 168, 56, 0.15)', color: '#e8a838', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Claims</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-hover)' }}>{formatINR(totalPending)}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#e8a838', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : payments.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Stage / Work Description</th>
                  <th>Claim Amount</th>
                  <th>Type</th>
                  <th>Disbursement Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.stage || 'Work Stage'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.description}</div>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '14px', color: 'var(--accent-hover)' }}>
                      {formatINR(p.amount)}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{p.payment_type || 'Disbursement'}</td>
                    <td>{formatDate(p.payment_date || p.created_at)}</td>
                    <td><StatusBadge status={p.status || 'pending'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No contractor disbursements recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
