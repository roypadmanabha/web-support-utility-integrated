import React, { useState } from 'react';

export default function LoginView({ onLogin, sessionExpiredMessage, theme, onToggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(sessionExpiredMessage || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your Email.');
      return;
    }
    if (password !== '12345') {
      setError('Invalid password. Demo password is: 12345');
      return;
    }
    setError('');
    onLogin(email.trim());
  };

  return (
    <div className="wsu-simple-login-wrapper">
      {/* Subtle theme toggle in corner */}
      <button
        type="button"
        className="wsu-theme-toggle wsu-simple-theme-toggle"
        onClick={onToggleTheme}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle dark/light mode"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Main Centered Minimal Card Matching User Demo Exactly */}
      <div className="wsu-simple-card">
        {/* Clarivate Logo */}
        <div className="wsu-simple-logo-container">
          <img src="/clarivate-logo.svg" alt="Clarivate" className="wsu-simple-logo" />
        </div>

        {error && (
          <div className="wsu-simple-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="wsu-simple-form">
          {/* Email Underline Input */}
          <div className="wsu-simple-field">
            <label className="wsu-simple-label">Email:</label>
            <input
              type="email"
              className="wsu-simple-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              autoFocus
              required
            />
          </div>

          {/* Password Underline Input */}
          <div className="wsu-simple-field" style={{ marginTop: '24px' }}>
            <label className="wsu-simple-label">Password:</label>
            <input
              type="password"
              className="wsu-simple-input"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              required
            />
          </div>

          {/* Login Button */}
          <button type="submit" className="wsu-simple-submit-btn">
            Login
          </button>
        </form>

        {/* Purple Dashed Divider */}
        <div className="wsu-simple-divider" />

        {/* Bottom Title & Subtitle */}
        <div className="wsu-simple-bottom">
          <h2 className="wsu-simple-title">Web Support Utility (WSU)</h2>
          <p className="wsu-simple-subtext">Session active for 30 minutes with synchronized cross-page timer.</p>
        </div>
      </div>
    </div>
  );
}
