import React, { useState, useEffect } from 'react';
import { Package, Plus, Search } from 'lucide-react';
import API from '../../api';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/format';

export default function ContractorMaterials() {
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '',
    quantity: '',
    unit: 'bags',
    rate: '0',
    party: 'contractor',
    status: 'pending',
  });

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const projRes = await API.get('/projects');
      const activeProj = projRes.data && projRes.data.length > 0 ? projRes.data[0] : null;
      setProject(activeProj);

      if (activeProj) {
        const matRes = await API.get(`/materials/project/${activeProj.id}`);
        // Backend filters by role automatically, or contractor sees their requests
        setMaterials(matRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching contractor materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!project) return;
    try {
      const { data } = await API.post(`/materials/project/${project.id}`, form);
      setMaterials([data, ...materials]);
      setIsModalOpen(false);
      setForm({ name: '', quantity: '', unit: 'bags', rate: '0', party: 'contractor', status: 'pending' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit requisition');
    }
  };

  const filtered = materials.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="section-gap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Materials & Site Requisitions</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Request building supplies and monitor delivery statuses on site
          </p>
        </div>

        <button className="btn btn--primary" onClick={() => setIsModalOpen(true)} disabled={!project}>
          <Plus size={16} /> Request Supply
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '34px', height: '36px' }}
              placeholder="Filter supplies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#e8a838', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Material Item</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Requested Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</td>
                    <td>{m.quantity}</td>
                    <td style={{ textTransform: 'capitalize' }}>{m.unit}</td>
                    <td><StatusBadge status={m.status || 'pending'} /></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                      {formatDate(m.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No material requisitions logged yet.
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Supply Request"
        size="md"
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" form="supply-form" className="btn btn--primary">Send Request</button>
          </>
        }
      >
        <form id="supply-form" onSubmit={handleRequest}>
          <div className="form-group">
            <label className="form-label">Material Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. River Sand / M-Sand"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Quantity Needed *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 20"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <select
                className="form-select"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <option value="bags">Bags</option>
                <option value="tons">Tons</option>
                <option value="loads">Truck Loads</option>
                <option value="units">Pieces / Units</option>
                <option value="litres">Litres</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
