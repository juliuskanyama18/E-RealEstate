const FONT = '"Inter", sans-serif';
const NAVY = '#042238';

export default function ConfirmModal({
  open,
  title = 'Confirm',
  message,
  confirmLabel = 'Delete',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(4,34,56,0.45)',
        padding: '0 16px',
        fontFamily: FONT,
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 12px 40px rgba(4,34,56,0.18)',
        width: '100%', maxWidth: 400,
        padding: '32px 28px 24px',
        animation: 'cm-pop 0.15s ease',
      }}>

        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: danger ? '#FEF2F2' : '#EFF6FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {danger ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 style={{
          margin: '0 0 8px', textAlign: 'center',
          fontSize: 18, fontWeight: 700, color: NAVY,
          letterSpacing: '-0.01em',
        }}>
          {title}
        </h3>

        {/* Message */}
        <p style={{
          margin: '0 0 28px', textAlign: 'center',
          fontSize: 14, color: '#6b7280', lineHeight: 1.65,
          whiteSpace: 'pre-line',
        }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1, padding: '10px 0',
              background: '#f3f4f6', color: '#374151',
              border: '1px solid #e5e7eb', borderRadius: 8,
              fontFamily: FONT, fontSize: 13, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e5e7eb'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: '10px 0',
              background: danger ? '#DC2626' : NAVY,
              color: '#fff',
              border: 'none', borderRadius: 8,
              fontFamily: FONT, fontSize: 13, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cm-pop {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}
