import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Trash2, Edit, Eye, FolderKanban } from 'lucide-react';
import API from '../../api';
import ProjectCard from '../../components/ProjectCard';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import ProgressBar from '../../components/ProgressBar';
import { formatINR, formatDate } from '../../utils/format';

export default function CompanyProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    budget: '',
    start_date: '',
    end_date: '',
    homeowner_id: '',
    contractor_id: '',
    description: '',
    status: 'planning',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, peopleRes] = await Promise.allSettled([
        API.get('/projects'),
        API.get('/projects/people'),
      ]);

      if (projRes.status === 'fulfilled') {
        setProjects(projRes.value.data || []);
      }
      if (peopleRes.status === 'fulfilled') {
        setPeople(peopleRes.value.data || []);
      }
    } catch (err) {
      console.error('Failed to load projects data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const homeowners = people.filter((p) => p.role === 'homeowner');
  const contractors = people.filter((p) => p.role === 'contractor');

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      location: '',
      budget: '',
      start_date: '',
      end_date: '',
      homeowner_id: '',
      contractor_id: '',
      description: '',
      status: 'planning',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project, e) => {
    e.stopPropagation();
    setEditingProject(project);
    setFormData({
      name: project.name || '',
      location: project.location || '',
      budget: project.budget || '',
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      end_date: project.end_date ? project.end_date.split('T')[0] : '',
      homeowner_id: project.homeowner_id || '',
      contractor_id: project.contractor_id || '',
      description: project.description || '',
      status: project.status || 'planning',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project? This will remove related materials and documents.')) {
      return;
    }
    try {
      await API.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      if (editingProject) {
        const { data } = await API.put(`/projects/${editingProject.id}`, formData);
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProject.id ? { ...p, ...data } : p))
        );
      } else {
        const { data } = await API.post('/projects', formData);
        setProjects((prev) => [data, ...prev]);
      }
      setIsModalOpen(false);
      fetchData(); // refresh full names
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save project. Please check fields.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(search.toLowerCase())) ||
      (p.homeowner_name && p.homeowner_name.toLowerCase().includes(search.toLowerCase())) ||
      (p.contractor_name && p.contractor_name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || p.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="section-gap">
      {/* Top Action & Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px', height: '40px' }}
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="form-select"
            style={{ width: '160px', height: '40px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>

          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px 14px',
                background: viewMode === 'grid' ? '#0f1b2d' : '#ffffff',
                color: viewMode === 'grid' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '12.5px',
                fontWeight: 600,
              }}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '8px 14px',
                background: viewMode === 'table' ? '#0f1b2d' : '#ffffff',
                color: viewMode === 'table' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '12.5px',
                fontWeight: 600,
              }}
            >
              Table
            </button>
          </div>
        </div>

        <button className="btn btn--primary" onClick={handleOpenCreate}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Content Rendering */}
      {loading ? (
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
      ) : filteredProjects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FolderKanban size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            No projects found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '6px', maxWidth: '400px', margin: '6px auto 20px' }}>
            Get started by initializing your first construction venture or adjust your filters.
          </p>
          <button className="btn btn--primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Launch Project
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid-3">
          {filteredProjects.map((p) => (
            <div key={p.id} style={{ position: 'relative' }}>
              <ProjectCard project={p} onClick={() => navigate(`/projects/${p.id}`)} />
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  display: 'flex',
                  gap: '6px',
                  zIndex: 10,
                }}
              >
                <button
                  className="btn btn--secondary btn--sm btn--icon"
                  style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                  onClick={(e) => handleOpenEdit(p, e)}
                  title="Edit Project"
                >
                  <Edit size={13} />
                </button>
                <button
                  className="btn btn--danger btn--sm btn--icon"
                  onClick={(e) => handleDelete(p.id, e)}
                  title="Delete Project"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Location</th>
                  <th>Homeowner</th>
                  <th>Contractor</th>
                  <th>Budget</th>
                  <th>Timeline</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => (
                  <tr key={p.id} onClick={() => navigate(`/projects/${p.id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.location || '—'}</td>
                    <td>{p.homeowner_name || 'Unassigned'}</td>
                    <td>{p.contractor_name || 'Unassigned'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-hover)' }}>{formatINR(p.budget)}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {formatDate(p.start_date)} - {formatDate(p.end_date)}
                    </td>
                    <td style={{ width: '120px' }}>
                      <ProgressBar progress={p.progress || 0} height={6} />
                    </td>
                    <td><StatusBadge status={p.status || 'planning'} /></td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn--outline btn--sm btn--icon"
                          onClick={(e) => handleOpenEdit(p, e)}
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn--danger btn--sm btn--icon"
                          onClick={(e) => handleDelete(p.id, e)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Project Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Construction Project' : 'Launch New Construction Project'}
        size="md"
        footer={
          <>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="project-form"
              className="btn btn--primary"
              disabled={formSubmitting}
            >
              {formSubmitting ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </>
        }
      >
        {formError && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', fontSize: '12.5px', marginBottom: '16px' }}>
            {formError}
          </div>
        )}

        <form id="project-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Skyline Residency, Phase 2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Location / City *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Whitefield, Bengaluru"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Budget (INR ₹) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 8500000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Completion Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Assigned Homeowner</label>
              <select
                className="form-select"
                value={formData.homeowner_id}
                onChange={(e) => setFormData({ ...formData, homeowner_id: e.target.value })}
              >
                <option value="">Select Homeowner (Optional)</option>
                {homeowners.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Contractor</label>
              <select
                className="form-select"
                value={formData.contractor_id}
                onChange={(e) => setFormData({ ...formData, contractor_id: e.target.value })}
              >
                <option value="">Select Contractor (Optional)</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {editingProject && (
            <div className="form-group">
              <label className="form-label">Project Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Description & Scope</label>
            <textarea
              className="form-textarea"
              placeholder="Outline project specifications, structural milestones, and architectural notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
