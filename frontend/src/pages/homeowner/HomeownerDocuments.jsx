import React, { useState, useEffect } from 'react';
import { FileText, Camera, ExternalLink, Download, Search } from 'lucide-react';
import API from '../../api';
import { formatDate } from '../../utils/format';

export default function HomeownerDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, blueprint, photo, permit

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const projRes = await API.get('/projects');
        const activeProj = projRes.data && projRes.data.length > 0 ? projRes.data[0] : null;

        if (activeProj) {
          const docRes = await API.get(`/documents/project/${activeProj.id}`);
          setDocuments(docRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching homeowner documents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const filteredDocs = documents.filter((d) => {
    if (activeTab === 'all') return true;
    return d.file_type === activeTab;
  });

  return (
    <div className="section-gap">
      {/* Header and Filter Tabs */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Documents & Architectural Designs</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Verified blueprints, municipal approvals, and weekly site inspection photos
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: 'All Files' },
            { id: 'blueprint', label: 'Blueprints' },
            { id: 'permit', label: 'Permits & NOC' },
            { id: 'photo', label: 'Site Photos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                background: activeTab === tab.id ? '#0f1b2d' : '#f1f5f9',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Documents */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#e8a838', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid-3">
          {filteredDocs.map((doc) => {
            const isPhoto = doc.file_type === 'photo';
            return (
              <div key={doc.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {isPhoto && doc.file_url ? (
                  <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#1e293b' }}>
                    <img src={doc.file_url} alt={doc.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(232, 168, 56, 0.15)', color: '#e8a838', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{doc.title || doc.file_name}</h4>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>
                        {doc.file_type || 'Document'}
                      </span>
                    </div>
                  </div>
                )}

                {!isPhoto && (
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {doc.description || 'Approved design documentation provided by the architectural firm.'}
                  </div>
                )}

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Verified {formatDate(doc.created_at)}</span>
                  {doc.file_url && (
                    <a
                      href={doc.file_url}
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
          <FileText size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No documents in this category</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
            Drawings and inspection photos will appear here as the builder uploads them.
          </p>
        </div>
      )}
    </div>
  );
}
