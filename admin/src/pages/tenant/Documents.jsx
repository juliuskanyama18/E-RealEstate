import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

const NAVY = '#042238';
const FONT = '"Open Sans","Inter",ui-sans-serif,system-ui,-apple-system,sans-serif';

const TYPE_LABEL = { property: 'Property', lease: 'Lease' };

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const TenantDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    axios.get(`${backendUrl}${API.tenant.documents}`)
      .then(r => setDocuments(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ width: 32, height: 32, border: `4px solid ${NAVY}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ flex: 1, background: '#f5f6f8', fontFamily: FONT, color: NAVY, minHeight: '100vh' }}>
        <div className="page-content" style={{ paddingTop: 28, paddingBottom: 48 }}>

          <h1 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: NAVY, fontFamily: FONT }}>Documents</h1>

          {documents.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '56px 24px', textAlign: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#d1d5db" style={{ margin: '0 auto 16px', display: 'block' }}>
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm2 16H8v-2h8zm0-4H8v-2h8zm-3-5V3.5L18.5 9z"/>
              </svg>
              <h3 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: NAVY, margin: '0 0 8px' }}>Documents</h3>
              <p style={{ fontFamily: FONT, fontSize: '1rem', color: '#9ca3af', margin: 0 }}>
                Your landlord has not shared any documents with you yet.
              </p>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 80px', padding: '10px 20px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                {['Document', 'Type', 'Date', ''].map(h => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em' }}>{h.toUpperCase()}</span>
                ))}
              </div>
              {/* Rows */}
              {documents.map((doc, idx) => {
                const fileUrl = doc.filePath
                  ? (doc.filePath.startsWith('http') ? doc.filePath : `${backendUrl}${doc.filePath}`)
                  : null;
                return (
                  <div
                    key={doc._id}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 80px', padding: '14px 20px', alignItems: 'center', borderBottom: idx < documents.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                  >
                    {/* Name + size */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={NAVY} style={{ flexShrink: 0 }}>
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm2 16H8v-2h8zm0-4H8v-2h8zm-3-5V3.5L18.5 9z"/>
                      </svg>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.originalName || doc.fileName}
                        </p>
                        {(doc.description || doc.fileSize) && (
                          <p style={{ margin: '2px 0 0', fontSize: '0.875rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {doc.description || formatSize(doc.fileSize)}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Type */}
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{TYPE_LABEL[doc.type] || doc.type}</span>
                    {/* Date */}
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{fmt(doc.createdAt)}</span>
                    {/* Download */}
                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        style={{ fontSize: '0.875rem', fontWeight: 600, color: NAVY, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 8h14v2H5z"/>
                        </svg>
                        View
                      </a>
                    ) : (
                      <span />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TenantDocuments;
