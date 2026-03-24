import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleEndSession = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const showEndSession = location.pathname !== '/start' && location.pathname !== '/';

  return (
    <header style={styles.header}>
      {/* Left: Tagline */}
      <div style={styles.left}>
        <span style={styles.tagline}>Where Intelligence Shapes Smarter Media Planning.</span>
      </div>

      {/* Center: Logo + Company Name */}
      <div style={styles.center}>
        <img src="/company-logo.png" alt="MTM Logo" style={styles.logo} />
        <h1 style={styles.title}>Third Shift Media (PVT) LTD</h1>
      </div>

      {/* Right: App context */}
      <div style={styles.right}>
        {showEndSession && (
          <button 
            onClick={handleEndSession}
            style={styles.endSessionBtn}
            onMouseOver={(e) => e.target.style.backgroundColor = '#fed7d7'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#fff5f5'}
          >
            End Session / Start Over
          </button>
        )}
        <span style={styles.environment}>Third-Party Monitoring Tool</span>
        <span style={styles.year}>2026</span>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#f7fafc',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    flexWrap: 'wrap',
    position: 'relative',
  },
  left: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  center: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '16px',
    fontSize: '14px',
    color: '#4a5568',
  },
  logo: {
    height: '40px',
    width: 'auto',
    objectFit: 'contain',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2d3748',
    margin: 0,
  },
  tagline: {
    fontSize: '14px',
    color: '#4a5568',
    fontStyle: 'italic',
  },
  environment: {
    backgroundColor: '#edf2f7',
    padding: '6px 12px',
    borderRadius: '20px',
    fontWeight: '500',
  },
  year: {
    fontWeight: '500',
  },
  endSessionBtn: {
    padding: '6px 12px',
    backgroundColor: '#fff5f5',
    color: '#c53030',
    border: '1px solid #fc8181',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginRight: '8px',
  }
};

export default Header;
