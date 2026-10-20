import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Aurel App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#11120f',
          color: '#eae8e1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'Manrope, sans-serif',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '540px',
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(234,232,225,0.14)',
            borderRadius: '16px',
            padding: '36px 28px',
          }}>
            <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
              Something encountered an issue while loading
            </h1>
            <p style={{ color: '#8a8a82', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#c5a77a',
                color: '#11120f',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontWeight: 600,
                fontSize: '13px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// React starts the app by rendering the main App component into #root with error boundary protection.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
