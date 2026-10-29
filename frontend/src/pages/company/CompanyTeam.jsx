import React, { useState, useEffect } from 'react';
import { Users, HardHat, Mail, UserPlus, Search, Phone, Shield } from 'lucide-react';
import API from '../../api';
import Modal from '../../components/Modal';
import { getInitials } from '../../utils/format';

export default function CompanyTeam() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'homeowner',
    password: 'Password123!',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/projects/people');
      setPeople(data || []);
    } catch (err) {
      console.error('Error fetching people:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/auth/register', inviteForm);
      alert(`User ${inviteForm.name} registered successfully!`);
      setIsModalOpen(false);
      setInviteForm({ name: '', email: '', role: 'homeowner', password: 'Password123!' });
      fetchPeople();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register person');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPeople = people.filter((p) => {
    const matchesSearch =
      (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="section-gap">
      {/* Top action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Team & Directory</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            Homeowners, general contractors, and trade specialists connected to your projects
          </p>
        </div>

        <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={16} /> Add Partner / Client
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '34px', height: '36px' }}
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'homeowner', 'contractor'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'capitalize',
                background: roleFilter === r ? '#0f1b2d' : '#f1f5f9',
                color: roleFilter === r ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {r === 'all' ? 'All Roles' : r + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#e8a838', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : filteredPeople.length > 0 ? (
        <div className="grid-3">
          {filteredPeople.map((p) => {
            const isContractor = p.role === 'contractor';
            return (
              <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: isContractor ? 'rgba(232, 168, 56, 0.15)' : 'rgba(59, 130, 246, 0.12)',
                      color: isContractor ? '#e8a838' : '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '15px',
                    }}
                  >
                    {getInitials(p.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {p.name}
                    </h4>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '11px',
                        textTransform: 'capitalize',
                        fontWeight: 600,
                        color: isContractor ? 'var(--accent-hover)' : 'var(--info)',
                        marginTop: '2px',
                      }}
                    >
                      {p.role}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} color="#94a3b8" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={14} color="#94a3b8" />
                    <span>Active Workspace Partner</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Users size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No partners found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '6px' }}>
            Invite contractors or homeowners to collaborate on your construction projects.
          </p>
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Partner to Directory"
        size="md"
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button
              type="submit"
              form="invite-user-form"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting ? 'Registering...' : 'Register Person'}
            </button>
          </>
        }
      >
        <form id="invite-user-form" onSubmit={handleInvite}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Anand Murthy"
              value={inviteForm.name}
              onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              placeholder="anand@example.com"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
            >
              <option value="homeowner">Homeowner</option>
              <option value="contractor">Contractor / Trade</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Temporary Access Password</label>
            <input
              type="text"
              className="form-input"
              value={inviteForm.password}
              onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
              required
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              They will be able to log in immediately with these credentials.
            </span>
          </div>
        </form>
      </Modal>
    </div>
  );
}
