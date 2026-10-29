import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Trash2, ExternalLink, Download, FileSpreadsheet } from 'lucide-react';
import API from '../../api';
import Modal from '../../components/Modal';
import FileUpload from '../../components/FileUpload';
import { formatDate } from '../../utils/format';

export default function CompanyDocuments() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [fileType, setFileType] = useState('blueprint');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const fetchDocuments = async (projId) => {
    if (!projId) return;
    try {
      setLoading(true);
      const { data } = await API.get(`/documents/project/${projId}`);
      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchDocuments(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('title', title || selectedFile.name);
      fd.append('file_type', fileType);
      fd.append('description', description);

      const { data } = await API.post(`/documents/project/${selectedProjectId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDocuments([data, ...documents]);
      setIsModalOpen(false);
      setSelectedFile(null);
      setTitle('');
      setDescription('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await API.delete(`/documents/${docId}`);
      setDocuments(documents.filter((d) => d.id !== docId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      (d.title && d.title.toLowerCase().includes(search.toLowerCase())) ||
      (d.file_name && d.file_name.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || d.file_type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="section-gap">
      {/* Top selector and action */}
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
          <Plus size={16} /> Upload Project Document
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
            placeholder="Search documents or blueprints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'blueprint', 'permit', 'contract', 'photo'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'capitalize',
                background: categoryFilter === cat ? '#0f1b2d' : '#f1f5f9',
                color: categoryFilter === cat ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {cat === 'all' ? 'All Files' : cat + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#e8a838', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid-3">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(232, 168, 56, 0.15)', color: '#e8a838', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {doc.title || doc.file_name}
                    </h4>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>
                      {doc.file_type || 'Document'}
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn--outline btn--sm btn--icon"
                  style={{ color: 'var(--danger)' }}
                  onClick={() => handleDelete(doc.id)}
                  title="Delete File"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {doc.description && (
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {doc.description}
                </p>
              )}

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Uploaded {formatDate(doc.created_at)}</span>
                {doc.file_url && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ExternalLink size={12} /> View File
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FileText size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>No documents found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '6px', maxWidth: '400px', margin: '6px auto 20px' }}>
            Upload blueprints, municipal approvals, or site photos for this project.
          </p>
          <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Upload First File
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Project Drawing or Document"
        size="md"
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button
              type="submit"
              form="doc-upload-form"
              className="btn btn--primary"
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Save & Upload'}
            </button>
          </>
        }
      >
        <form id="doc-upload-form" onSubmit={handleUpload}>
          <div className="form-group">
            <label className="form-label">Document Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Approved Floor Plan 2026 Rev B"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Classification / Category</label>
            <select
              className="form-select"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
            >
              <option value="blueprint">Architectural Blueprint / Drawing</option>
              <option value="permit">Government Permit / NOC</option>
              <option value="contract">Owner-Builder Contract</option>
              <option value="photo">Site Inspection Photo</option>
              <option value="specification">Bill of Quantities / Spec Sheet</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">File Asset *</label>
            <FileUpload
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              onClear={() => setSelectedFile(null)}
              label="Click or drag blueprint or document here"
              hint="PDF, DWG, PNG, JPEG up to 30MB"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Revision Notes (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Detail structural amendments or approval reference numbers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
