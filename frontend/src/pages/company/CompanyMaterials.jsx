import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, Trash2, Edit } from 'lucide-react';
import API from '../../api';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { formatINR } from '../../utils/format';

export default function CompanyMaterials() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [materials, setMaterials] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterParty, setFilterParty] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    name: '',
    quantity: '',
    unit: 'bags',
    rate: '',
    party: 'contractor',
    status: 'pending',
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

  const fetchMaterials = async (projId) => {
    if (!projId) return;
    try {
      setLoading(true);
      const [matRes, sumRes] = await Promise.allSettled([
        API.get(`/materials/project/${projId}`),
        API.get(`/materials/project/${projId}/summary`),
      ]);

      if (matRes.status === 'fulfilled') setMaterials(matRes.value.data || []);
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchMaterials(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      name: '',
      quantity: '',
      unit: 'bags',
      rate: '',
      party: 'contractor',
      status: 'pending',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || '',
      quantity: item.quantity || '',
      unit: item.unit || 'bags',
      rate: item.rate || '',
      party: item.party || 'contractor',
      status: item.status || 'pending',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material record?')) return;
    try {
      await API.delete(`/materials/${id}`);
      setMaterials(materials.filter((m) => m.id !== id));
      fetchMaterials(selectedProjectId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete material');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const { data } = await API.put(`/materials/${editingItem.id}`, form);
        setMaterials(materials.map((m) => (m.id === editingItem.id ? { ...m, ...data } : m)));
      } else {
        const { data } = await API.post(`/materials/project/${selectedProjectId}`, form);
        setMaterials([data, ...materials]);
      }
      setIsModalOpen(false);
      fetchMaterials(selectedProjectId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save material record');
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = m.name?.toLowerCase().includes(search.toLowerCase());
    const matchesParty = filterParty === 'all' || m.party === filterParty;
    return matchesSearch && matchesParty;
  });

  return (
    <div className="section-gap">
      {/* Top project selector & summary */}
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

        <button className="btn btn--primary" onClick={handleOpenAdd} disabled={!selectedProjectId}>
          <Plus size={16} /> Add Material Requisition
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid-3">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(232, 168, 56, 0.15)', color: '#e8a838', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Grand Materials Total</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatINR(summary?.grand_total ?? materials.reduce((s, m) => s + (m.quantity * m.rate || 0), 0))}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Homeowner Sourced</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatINR(summary?.homeowner_total ?? 0)}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Contractor Procured</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatINR(summary?.contractor_total ?? 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Materials Table Card */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '34px', height: '36px' }}
              placeholder="Search material item..."
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
            <option value="contractor">Contractor Side</option>
            <option value="homeowner">Homeowner Side</option>
          </select>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#e8a838', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filteredMaterials.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Unit Rate</th>
                  <th>Total Cost</th>
                  <th>Party</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</td>
                    <td>{m.quantity} {m.unit || 'units'}</td>
                    <td>{formatINR(m.rate)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatINR((Number(m.quantity) || 0) * (Number(m.rate) || 0))}
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', textTransform: 'capitalize', padding: '2px 8px', borderRadius: '4px', background: m.party === 'homeowner' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(232, 168, 56, 0.12)', color: m.party === 'homeowner' ? '#3b82f6' : '#d97706', fontWeight: 600 }}>
                        {m.party || 'contractor'}
                      </span>
                    </td>
                    <td><StatusBadge status={m.status || 'pending'} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button className="btn btn--outline btn--sm btn--icon" onClick={() => handleOpenEdit(m)} title="Edit">
                          <Edit size={13} />
                        </button>
                        <button className="btn btn--danger btn--sm btn--icon" onClick={() => handleDelete(m.id)} title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No materials found for this project.
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Material Item' : 'New Material Requisition'}
        size="md"
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" form="mat-entry-form" className="btn btn--primary">
              {editingItem ? 'Update Item' : 'Create Item'}
            </button>
          </>
        }
      >
        <form id="mat-entry-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Material Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Red Clay Bricks (Class A)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 5000"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measurement</label>
              <select
                className="form-select"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <option value="bags">Bags</option>
                <option value="tons">Tons</option>
                <option value="units">Units / Pieces</option>
                <option value="sqft">Sq Ft</option>
                <option value="litres">Litres</option>
                <option value="loads">Truck Loads</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Unit Rate (INR ₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 12"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Procuring Party</label>
              <select
                className="form-select"
                value={form.party}
                onChange={(e) => setForm({ ...form, party: e.target.value })}
              >
                <option value="contractor">Contractor Side</option>
                <option value="homeowner">Homeowner Side</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Requisition Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="ordered">Ordered</option>
              <option value="delivered">Delivered on Site</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
