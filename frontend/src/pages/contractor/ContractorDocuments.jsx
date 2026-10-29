import React, { useState, useEffect } from 'react';
import { Camera, FileText, Plus, ExternalLink } from 'lucide-react';
import API from '../../api';
import Modal from '../../components/Modal';
import FileUpload from '../../components/FileUpload';
import { formatDate } from '../../utils/format';

export default function ContractorDocuments() {
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [fileType, setFileType] = useState('photo');
  const [uploading, setUploading] = useState(false);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const projRes = await API.get('/projects');
      const activeProj = projRes.data && projRes.data.length > 0 ? projRes.data[0] : null;
      setProject(activeProj);

      if (activeProj) {
        const docRes = await API.get(`/documents/project/${activeProj.id}`);
        setDocuments(docRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching contractor documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!project || !file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title || file.name);
      fd.append('file_type', fileType);

      const { data } = await API.post(`/documents/project/${project.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDocuments([data, ...documents]);
      setIsModalOpen(false);
      setFile(null);
      setTitle('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload photo or document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="section-gap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Site Photos & Blueprints</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Reference structural sheets and log photographic proof of completed work
          </p>
        </div>

        <button className="btn btn--primary" onClick={() => setIsModalOpen(true)} disabled={!project}>
          <Camera size={16} /> Upload Site Verification Photo
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#e8a838', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : documents.length > 0 ? (
        <div className="grid-3">
          {documents.map((d) => {
            const isPhoto = d.file_type === 'photo';
            return (
              <div key={d.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {isPhoto && d.file_url ? (
                  <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#1e293b' }}>
                    <img src={d.file_url} alt={d.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(232, 168, 56, 0.15)', color: '#e8a838', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{d.title || d.file_name}</h4>
                      <span style={{ fontSize: '11px', textTransform: 'capitalize', color: 'var(--accent)', fontWeight: 600 }}>
                        {d.file_type || 'Drawing'}
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Logged {formatDate(d.created_at)}</span>
                  {d.file_url && (
                    <a
                      href={d.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn--outline btn--sm"
                    >
                      <ExternalLink size={12} /> View File
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Camera size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No site documents yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
            Upload rebar or footing inspection photos to request stage sign-offs.
          </p>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Inspection Asset"
        size="md"
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button
              type="submit"
              form="contractor-doc-form"
              className="btn btn--primary"
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Save Asset'}
            </button>
          </>
        }
      >
        <form id="contractor-doc-form" onSubmit={handleUpload}>
          <div className="form-group">
            <label className="form-label">Asset Title / Description *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Footing Trench Inspection & Rebar"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
            >
              <option value="photo">Site Photo</option>
              <option value="report">Field Test / Cube Test Report</option>
              <option value="blueprint">Site Drawing</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">File</label>
            <FileUpload
              selectedFile={file}
              onFileSelect={setFile}
              onClear={() => setFile(null)}
              label="Select inspection image or test report"
              hint="JPG, PNG, PDF"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
