import React, { useState } from 'react';

export default function LoginView({ onLogin, sessionExpiredMessage, theme, onToggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(sessionExpiredMessage || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your Email Address.');
      return;
    }
    if (password !== '12345') {
      setError('Invalid password. For demo, use: 12345');
      return;
    }
    setError('');
    onLogin(email.trim());
  };

  const handleQuickDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('12345');
    setError('');
    onLogin(demoEmail);
  };

  return (
    <div className="wsu-login-container">
      {/* Top Header Strip with Theme Toggle */}
      <header className="wsu-login-header">
        <div className="wsu-header-logo-container">
          <img src="/clarivate-logo.svg" alt="Clarivate Logo" className="wsu-header-logo" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '0.82rem', color: 'inherit', fontWeight: 600 }}>Clarivate Authentication</span>
          <button
            type="button"
            className="wsu-theme-toggle"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark/light mode"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="wsu-login-main">
        <div className="wsu-login-card">
          <div className="wsu-login-brand">
            <h1 className="wsu-login-title">Web Support Utility (WSU)</h1>
            <p className="wsu-login-subtitle">Secure Staff Portal & Registration Services</p>
          </div>

          {error && (
            <div className="wsu-login-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="wsu-login-form">
            <div className="wsu-form-group" style={{ marginBottom: '16px' }}>
              <label className="wsu-login-label">
                Email:
              </label>
              <input
                type="email"
                className="wsu-input"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. padmanabha.roy@clarivate.com"
                autoFocus
                required
              />
              <span className="wsu-login-hint">Any email address is accepted</span>
            </div>

            <div className="wsu-form-group" style={{ marginBottom: '22px' }}>
              <label className="wsu-login-label">
                Password:
              </label>
              <input
                type="password"
                className="wsu-input"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter password (demo: 12345)"
                required
              />
              <span className="wsu-login-hint">Demo Password: <strong>12345</strong></span>
            </div>

            <button
              type="submit"
              className="wsu-btn-primary"
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.3px',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          </form>

          {/* Quick Demo Login Preset */}
          <div className="wsu-login-quick">
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Quick Demo Access:</span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                className="wsu-action-btn"
                onClick={() => handleQuickDemo('padmanabha.roy@clarivate.com')}
                style={{ padding: '6px 12px', height: 'auto', fontSize: '0.75rem', flex: 1 }}
              >
                Log In as padmanabha.roy@clarivate.com
              </button>
            </div>
          </div>

          <div className="wsu-login-footer">
            <p>Session active for 30 minutes with synchronized cross-page timer.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
