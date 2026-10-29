import React, { useEffect, useRef } from 'react';

/**
 * Validates whether a given string is a syntactically valid email address.
 * Rejects URLs, random strings, missing domains, missing @, or embedded spaces.
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0) return false;

  // Cannot contain spaces anywhere
  if (/\s/.test(trimmed)) return false;

  // RFC-5322 compliant practical email pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
};

/**
 * Standard Clarivate WSU "Invalid email address" popup modal with an OK button.
 * Adheres strictly to Clarivate brand palette (#5E33BF, #F0F0EB, #000000).
 */
export default function InvalidEmailModal({
  isOpen,
  onClose,
  message = 'Invalid email address',
  description = 'Please enter a valid email address (e.g. name@domain.com) and try again.',
  theme = 'light'
}) {
  const okButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Auto-focus OK button on open
    const timer = setTimeout(() => {
      if (okButtonRef.current) {
        okButtonRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDark =
    theme === 'dark' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invalid-email-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100000,
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
          border: '2px solid #5E33BF',
          borderRadius: '4px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
          padding: '24px 28px',
          textAlign: 'center',
          fontFamily: "'Clarivate', 'Clarivate Regular', Futura, 'Memphis', 'Karnak', sans-serif",
          color: isDark ? '#FFFFFF' : '#000000',
          animation: 'wsuFadeIn 0.18s ease-out'
        }}
      >
        {/* Clarivate Purple Alert Icon */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: isDark ? '#000000' : '#F0F0EB',
            border: '2px solid #5E33BF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: '#5E33BF'
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5E33BF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Modal Title */}
        <h2
          id="invalid-email-modal-title"
          style={{
            margin: '0 0 10px 0',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: isDark ? '#FFFFFF' : '#000000'
          }}
        >
          {message}
        </h2>

        {/* Modal Description */}
        <p
          style={{
            margin: '0 0 22px 0',
            fontSize: '0.88rem',
            lineHeight: 1.45,
            color: isDark ? '#FFFFFF' : '#000000',
            opacity: 0.9
          }}
        >
          {description}
        </p>

        {/* OK Button */}
        <div>
          <button
            ref={okButtonRef}
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#5E33BF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '2px',
              padding: '8px 36px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
