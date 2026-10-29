import React, { useState, useEffect } from 'react';
import { useUndoableInputs } from './useUndoableInputs';
import InvalidEmailModal, { isValidEmail } from './InvalidEmailModal';

// Strict Clarivate brand colors only:
// #5E33BF (Clarivate Purple), #F0F0EB (Off-white), #000000 (Black)

export default function UserTemporaryCredentialsView({ theme = 'light', onShowToast }) {
  const isDark =
    theme === 'dark' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark');

  const [emailInput, setEmailInput] = useState('padmanabharoy@gmail.com');
  const [userName, setUserName] = useState('padmanabharoy@gmail.com');
  const [tempPassword, setTempPassword] = useState('Tmp#8921xQ!');
  const [copiedKey, setCopiedKey] = useState(null);
  const [status, setStatus] = useState(null);
  const [showInvalidEmailModal, setShowInvalidEmailModal] = useState(false);

  const [emailWasCopied, setEmailWasCopied] = useState(false);

  useEffect(() => {
    setEmailWasCopied(false);
  }, [emailInput]);

  const isEmailCopyMode = Boolean(emailInput && emailInput.trim().length > 0 && !emailWasCopied);

  const { clearField, undoField, canUndo, registerRef } = useUndoableInputs(
    {
      email: setEmailInput
    },
    onShowToast
  );

  const handleCopy = (text, key, label) => {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
    if (onShowToast) onShowToast(`Copied ${label}: ${text}`);
  };

  const handleEmailCopyOrPaste = () => {
    if (isEmailCopyMode) {
      handleCopy(emailInput, 'email', 'Email');
      setEmailWasCopied(true);
    } else {
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then((text) => {
          if (text) {
            setEmailInput(text);
            setEmailWasCopied(false);
            if (onShowToast) onShowToast('Pasted into Email Address');
          }
        }).catch(() => {});
      }
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let res = 'Tmp#';
    for (let i = 0; i < 7; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const handleAccessByEmail = (e) => {
    if (e) e.preventDefault();
    const email = emailInput.trim();
    if (!email) {
      setStatus({ type: 'error', message: 'Please provide an email address.' });
      if (onShowToast) onShowToast('Please provide an email address');
      return;
    }
    if (!isValidEmail(email)) {
      setShowInvalidEmailModal(true);
      return;
    }

    const newPass = generateRandomPassword();
    setUserName(email);
    setTempPassword(newPass);
    setStatus({
      type: 'success',
      message: `Generated active temporary credentials for ${email}`
    });
    if (onShowToast) onShowToast(`Temporary credentials generated for ${email}`);
  };

  return (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        color: isDark ? '#FFFFFF' : '#000000'
      }}
    >
      {/* Title matching Screenshot 3 */}
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          margin: '0 0 16px 0',
          color: isDark ? '#FFFFFF' : '#000000'
        }}
      >
        User Temporary Credential Builder
      </h1>

      <p
        style={{
          fontSize: '0.86rem',
          fontWeight: 700,
          margin: '0 0 24px 0',
          color: isDark ? '#FFFFFF' : '#000000'
        }}
      >
        EndNote User Temporary Credential Builder
      </p>

      {/* Email Input Row with Copy & Clear buttons */}
      <form onSubmit={handleAccessByEmail} style={{ marginBottom: '28px', maxWidth: '780px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <label
            style={{
              width: '70px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: isDark ? '#FFFFFF' : '#000000'
            }}
          >
            Email:
          </label>
          <input
            ref={registerRef('email')}
            data-field="email"
            type="text"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => {
              const isCtrlOrMeta = e.ctrlKey || e.metaKey;
              const k = e.key ? e.key.toLowerCase() : '';
              if (isCtrlOrMeta && (k === 'z' || k === 'u')) {
                e.preventDefault();
                undoField('email', 'Email');
              }
            }}
            style={{
              width: '320px',
              height: '28px',
              padding: '2px 8px',
              fontSize: '0.84rem',
              border: '1px solid #5E33BF',
              borderRadius: '2px',
              backgroundColor: isDark ? '#000000' : '#FFFFFF',
              color: isDark ? '#FFFFFF' : '#000000',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
          <button
            type="button"
            onClick={handleEmailCopyOrPaste}
            style={{
              height: '28px',
              padding: '0 10px',
              backgroundColor: '#5E33BF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '2px',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {isEmailCopyMode ? 'Copy' : 'Paste'}
          </button>
          <button
            type="button"
            onClick={() => {
              clearField('email', emailInput, 'Email');
              setEmailWasCopied(false);
            }}
            title="Clear input (Ctrl+Z or U to return back)"
            style={{
              height: '28px',
              padding: '0 10px',
              backgroundColor: isDark ? '#565656' : '#F0F0EB',
              color: isDark ? '#FFFFFF' : '#000000',
              border: '1px solid #000000',
              borderRadius: '2px',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Clear
          </button>

          <button
            type="submit"
            style={{
              height: '28px',
              padding: '0 12px',
              backgroundColor: '#5E33BF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '2px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Access By Email
          </button>
        </div>
      </form>

      {/* Output details matching Screenshot 3 */}
      <div
        style={{
          border: '1px solid #5E33BF',
          borderRadius: '4px',
          padding: '20px 24px',
          maxWidth: '680px',
          backgroundColor: isDark ? '#000000' : '#FFFFFF'
        }}
      >
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '170px', fontSize: '0.88rem', fontWeight: 600 }}>
            User name:
          </span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#5E33BF' }}>
            {userName || '—'}
          </span>
          {userName && (
            <button
              type="button"
              onClick={() => handleCopy(userName, 'username', 'User name')}
              style={{
                height: '22px',
                padding: '0 8px',
                backgroundColor: '#5E33BF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '2px',
                fontSize: '0.7rem',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {copiedKey === 'username' ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '170px', fontSize: '0.88rem', fontWeight: 600 }}>
            Temporary Password:
          </span>
          <code
            style={{
              fontSize: '0.94rem',
              fontWeight: 800,
              backgroundColor: isDark ? '#565656' : '#F0F0EB',
              padding: '2px 8px',
              borderRadius: '2px',
              color: isDark ? '#FFFFFF' : '#000000'
            }}
          >
            {tempPassword || '—'}
          </code>
          {tempPassword && (
            <button
              type="button"
              onClick={() => handleCopy(tempPassword, 'temp-pass', 'Temporary Password')}
              style={{
                height: '22px',
                padding: '0 8px',
                backgroundColor: '#5E33BF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '2px',
                fontSize: '0.7rem',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {copiedKey === 'temp-pass' ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

        {status && (
          <div
            style={{
              fontSize: '0.8rem',
              color: '#5E33BF',
              fontWeight: 600,
              marginTop: '10px'
            }}
          >
            {status.message}
          </div>
        )}
      </div>

      {/* Invalid email popup modal with OK button */}
      <InvalidEmailModal
        isOpen={showInvalidEmailModal}
        onClose={() => setShowInvalidEmailModal(false)}
        theme={theme}
      />
    </div>
  );
}
