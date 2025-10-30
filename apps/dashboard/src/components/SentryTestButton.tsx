export function SentryTestButton() {
  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <button
      onClick={() => {
        throw new Error('This is your first error!');
      }}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 20px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#dc2626';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#ef4444';
      }}
    >
      🔥 Test Sentry Error
    </button>
  );
}

