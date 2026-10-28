import React, { useState, useEffect } from 'react';

const LAST_USED_EMAIL_KEY = 'clarivate_last_used_email';
const SAVED_EMAILS_KEY = 'clarivate_saved_user_emails';
const SAVED_PASSWORD_KEY = 'clarivate_saved_user_password';

const getInitialSavedEmails = () => {
  try {
    const raw = localStorage.getItem(SAVED_EMAILS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!list.includes('padmanabha.roy@clarivate.com')) {
      list.unshift('padmanabha.roy@clarivate.com');
    }
    return list;
  } catch (e) {
    return ['padmanabha.roy@clarivate.com'];
  }
};

export default function LoginView({ onLogin, sessionExpiredMessage }) {
  const [savedEmails, setSavedEmails] = useState(getInitialSavedEmails);
  const [email, setEmail] = useState(() => {
    try {
      const last = localStorage.getItem(LAST_USED_EMAIL_KEY);
      if (last) return last;
      const list = getInitialSavedEmails();
      return list[0] || 'padmanabha.roy@clarivate.com';
    } catch (e) {
      return 'padmanabha.roy@clarivate.com';
    }
  });
  const [password, setPassword] = useState(() => {
    try {
      return localStorage.getItem(SAVED_PASSWORD_KEY) || '12345';
    } catch (e) {
      return '12345';
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(sessionExpiredMessage || '');

  useEffect(() => {
    if (sessionExpiredMessage) {
      setError(sessionExpiredMessage);
    }
  }, [sessionExpiredMessage]);

  // Enforce strictly light mode on login page unconditionally
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your Email.');
      return;
    }
    if (password !== '12345') {
      setError('Invalid password. Demo password is: 12345');
      return;
    }
    setError('');

    // Save both last used email and password to localStorage so user can log in next time at ease without retyping
    try {
      localStorage.setItem(LAST_USED_EMAIL_KEY, trimmedEmail);
      const updatedList = [trimmedEmail, ...savedEmails.filter(em => em.toLowerCase() !== trimmedEmail.toLowerCase())].slice(0, 10);
      localStorage.setItem(SAVED_EMAILS_KEY, JSON.stringify(updatedList));
      localStorage.setItem(SAVED_PASSWORD_KEY, password);
    } catch (err) {}

    onLogin(trimmedEmail);
  };

  return (
    <div className="wsu-simple-login-wrapper">
      {/* Informational Notice Centered Above Login Card */}
      <div className="wsu-login-notice">
        <p>This is the login page for accessing the EndNote Web Support Utility.</p>
        <p>
          If you do not have an account for the Support Utility you can contact:{' '}
          <a
            href="mailto:ipsci.researchsolutions-engineering@clarivate.com"
            className="wsu-login-mail-link"
          >
            ipsci.researchsolutions-engineering@clarivate.com
          </a>
        </p>
      </div>

      {/* Main Centered Minimal Card Matching User Demo */}
      <div className="wsu-simple-card">
        {/* Clarivate Logo - Dragging Disabled */}
        <div className="wsu-simple-logo-container">
          <img
            src="/clarivate-logo.svg"
            alt="Clarivate"
            className="wsu-simple-logo"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>

        {error && (
          <div className="wsu-simple-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="wsu-simple-form">
          {/* Email Underline Input with Dropdown & Autocomplete */}
          <div className="wsu-simple-field">
            <label className="wsu-simple-label" htmlFor="wsu-login-email">Email:</label>
            <input
              id="wsu-login-email"
              type="email"
              className="wsu-simple-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              list="wsu-saved-emails"
              autoComplete="email"
              autoFocus
              required
            />
            {/* Native dropdown datalist for quick selection */}
            <datalist id="wsu-saved-emails">
              {savedEmails.map((saved) => (
                <option key={saved} value={saved} />
              ))}
            </datalist>
          </div>

          {/* Password Underline Input with Eye Toggle Icon */}
          <div className="wsu-simple-field" style={{ marginTop: '24px' }}>
            <label className="wsu-simple-label" htmlFor="wsu-login-password">Password:</label>
            <div className="wsu-password-input-row">
              <input
                id="wsu-login-password"
                type={showPassword ? 'text' : 'password'}
                className="wsu-simple-input"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                required
              />
              <button
                type="button"
                className="wsu-password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  /* Eye-off Icon */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  /* Eye Icon */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
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
          <p className="wsu-simple-subtext">Session remains active for 30 minutes with a cross-page timer.</p>
        </div>
      </div>
    </div>
  );
}
