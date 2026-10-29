import React, { useState } from 'react';
import InvalidEmailModal, { isValidEmail } from './InvalidEmailModal';

// Strict Clarivate brand palette:
// #5E33BF (Clarivate Purple), #F0F0EB (Off-white), #000000 (Black)

export default function CustomerPasswordView({ theme = 'light', onShowToast }) {
  const isDark =
    theme === 'dark' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark');

  const [customerEmail, setCustomerEmail] = useState('padmanabharoy@gmail.com');
  const [customerPassword, setCustomerPassword] = useState('');
  const [product, setProduct] = useState('EndNote Web');
  const [locale, setLocale] = useState('English');
  const [resetUrl, setResetUrl] = useState('');
  const [urlCopied, setUrlCopied] = useState(false);
  const [currentPasswordRevealed, setCurrentPasswordRevealed] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [showInvalidEmailModal, setShowInvalidEmailModal] = useState(false);

  // Search history for email (last 5 searches)
  const [emailHistory, setEmailHistory] = useState([
    'padmanabharoy@gmail.com',
    'john.t.muller@questdiagnostics.com',
    'mario.beaudoin@uqtr.ca',
    'dennis.jones@us.dlapiper.com',
    'support.endnote@clarivate.com'
  ]);
  const [showHistory, setShowHistory] = useState(false);

  // Password validation checks
  const hasMinLength = customerPassword.length >= 8;
  const hasNumeric = /\d/.test(customerPassword);
  const hasSpecial = /[!@#$%^*()~`{}[\]|\\&_]/.test(customerPassword);

  const handleSetPassword = (e) => {
    if (e) e.preventDefault();
    const email = customerEmail.trim();
    if (!email) {
      setPasswordStatus({ type: 'error', message: 'Please enter a valid customer email.' });
      return;
    }
    if (!isValidEmail(email)) {
      setShowInvalidEmailModal(true);
      return;
    }
    if (!hasMinLength || !hasNumeric || !hasSpecial) {
      setPasswordStatus({
        type: 'error',
        message: 'Password must satisfy all policy requirements (8+ chars, 1 number, 1 special character).'
      });
      return;
    }

    setPasswordStatus({
      type: 'success',
      message: `Password for ${email} updated successfully.`
    });
    if (onShowToast) onShowToast(`Password updated for ${email}`);
  };

  const handleGetCurrentPassword = () => {
    const email = customerEmail.trim();
    if (!email) {
      setPasswordStatus({ type: 'error', message: 'Please enter a customer email address.' });
      return;
    }
    if (!isValidEmail(email)) {
      setShowInvalidEmailModal(true);
      return;
    }

    // Permission notice according to policy
    setCurrentPasswordRevealed('ClarivatePass2026!');
    setPasswordStatus({
      type: 'success',
      message: `Supervisor permission verified. Current password retrieved for ${email}.`
    });
    if (onShowToast) onShowToast(`Current password retrieved for ${email}`);
  };

  const handleGenerateResetUrl = (e) => {
    if (e) e.preventDefault();
    const email = customerEmail.trim();
    if (!email) {
      setPasswordStatus({ type: 'error', message: 'Please enter a customer email address.' });
      return;
    }
    if (!isValidEmail(email)) {
      setShowInvalidEmailModal(true);
      return;
    }

    // Auth token format matching legacy WSU: i-0a78f761665b6b4b7:ijuucfUtR6yTLoKmvhuUjg
    const hexPart = Math.random().toString(16).substring(2, 12) + Math.random().toString(16).substring(2, 10);
    const b64Part = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    const authToken = `i-0a78f${hexPart.substring(0, 12)}:${b64Part.substring(0, 20)}`;

    let localeCode = 'en_US';
    if (locale === 'Japanese') localeCode = 'ja_JP';
    else if (locale === 'German') localeCode = 'de_DE';
    else if (locale === 'French') localeCode = 'fr_FR';
    else if (locale === 'Spanish') localeCode = 'es_ES';
    else if (locale === 'Simplified Chinese') localeCode = 'zh_CN';
    else if (locale === 'Traditional Chinese') localeCode = 'zh_TW';

    let productCode = 'enw';
    if (product === 'EndNote Online') productCode = 'online';
    else if (product === 'EndNote Desktop') productCode = 'desktop';

    const generated = `https://account.endnote.com/enwservices/forgottenpassword/?authToken=${authToken}&locale=${localeCode}&product=${productCode}`;
    setResetUrl(generated);
    setUrlCopied(false);
    if (onShowToast) onShowToast(`Generated Password Reset URL for ${email}`);
  };

  const handleCopyUrl = () => {
    if (!resetUrl) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(resetUrl);
    } else {
      const ta = document.createElement('textarea');
      ta.value = resetUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
    if (onShowToast) onShowToast('Password Reset URL copied to clipboard');
  };

  const inputBg = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const borderColor = isDark ? '#5E33BF' : '#000000';
  const lightGreyBg = isDark ? '#1C1C1C' : '#EAEAE5';

  return (
    <div
      style={{
        width: '100%',
        fontFamily: "Arial, Helvetica, sans-serif",
        color: textColor,
        backgroundColor: isDark ? '#000000' : '#F0F0EB'
      }}
    >
      {/* 1. Main Page Title */}
      <h1
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: textColor,
          margin: '0 0 16px 0',
          letterSpacing: '-0.2px'
        }}
      >
        Customer Password
      </h1>

      {/* 2. Password Policy Section */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: '0.98rem',
            fontWeight: 700,
            color: textColor,
            margin: '0 0 10px 0'
          }}
        >
          PASSWORD POLICY – PLEASE READ
        </h2>

        <ul
          style={{
            margin: '0 0 16px 0',
            paddingLeft: '20px',
            fontSize: '0.86rem',
            lineHeight: 1.5,
            color: textColor
          }}
        >
          <li style={{ marginBottom: '8px' }}>
            To protect customer security, password retrieval is now limited to supervisors and team/project leads only. If you require access to a customer's account for testing, please obtain explicit permission from the customer, and speak with your supervisor or lead.
          </li>
          <li style={{ marginBottom: '8px' }}>
            If a customer is not receiving the password reminder email from the <strong>no-reply@endnote.com</strong> address, use the 'Get Password Reset URL' option to generate a link to the password reset form and send this via Salesforce.com. Don't forget to confirm that the email address for their account is correct. For security reasons, this should not be sent to an email address other than the one on record.
          </li>
          <li style={{ marginBottom: '8px' }}>
            If a customer does not have access to their original email account, for their own security, we should not send any passwords or reset links. Instead, regretfully inform them that we cannot restore their access. If the customer expresses extreme displeasure, these cases should be referred directly to Gandalf.
          </li>
        </ul>
      </div>

      {/* 3. Password Management Form */}
      <div style={{ marginBottom: '28px' }}>
        <table style={{ borderCollapse: 'collapse', marginBottom: '12px' }}>
          <tbody>
            {/* Customer email row */}
            <tr>
              <td
                style={{
                  padding: '6px 16px 6px 0',
                  fontSize: '0.88rem',
                  color: textColor,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle'
                }}
              >
                Customer email:
              </td>
              <td style={{ padding: '6px 0', position: 'relative' }}>
                <input
                  type="text"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                  style={{
                    width: '310px',
                    height: '26px',
                    padding: '2px 8px',
                    fontSize: '0.88rem',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '2px',
                    backgroundColor: inputBg,
                    color: textColor,
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  autoComplete="off"
                />

                {/* Last 5 searches dropdown */}
                {showHistory && emailHistory.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '32px',
                      left: 0,
                      width: '310px',
                      backgroundColor: inputBg,
                      border: '1px solid #5E33BF',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      zIndex: 1000,
                      borderRadius: '2px'
                    }}
                  >
                    <div
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#5E33BF',
                        borderBottom: `1px solid ${borderColor}`,
                        backgroundColor: isDark ? '#1F1F1F' : '#F0F0EB'
                      }}
                    >
                      Recent Email Searches
                    </div>
                    {emailHistory.map((item, idx) => (
                      <div
                        key={idx}
                        onMouseDown={() => {
                          setCustomerEmail(item);
                          setShowHistory(false);
                        }}
                        style={{
                          padding: '5px 8px',
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          color: textColor,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isDark ? '#2D2D2D' : '#F0F0EB';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = inputBg;
                        }}
                      >
                        <span style={{ color: '#5E33BF', fontSize: '0.75rem' }}>🕒</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </td>
            </tr>

            {/* Customer password row */}
            <tr>
              <td
                style={{
                  padding: '6px 16px 6px 0',
                  fontSize: '0.88rem',
                  color: textColor,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle'
                }}
              >
                Customer password:
              </td>
              <td style={{ padding: '6px 0' }}>
                <input
                  type="text"
                  value={customerPassword}
                  onChange={(e) => setCustomerPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{
                    width: '310px',
                    height: '26px',
                    padding: '2px 8px',
                    fontSize: '0.88rem',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '2px',
                    backgroundColor: inputBg,
                    color: textColor,
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  autoComplete="off"
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Password Policy Requirements Checklist */}
        <div
          style={{
            marginLeft: '140px',
            marginBottom: '14px',
            fontSize: '0.82rem',
            lineHeight: 1.45,
            color: textColor
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: hasMinLength ? '#5E33BF' : (isDark ? '#888888' : '#666666') }}>
              {hasMinLength ? '✓' : '•'}
            </span>
            <span>Password should be at least 8 characters long</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: hasNumeric ? '#5E33BF' : (isDark ? '#888888' : '#666666') }}>
              {hasNumeric ? '✓' : '•'}
            </span>
            <span>Password should have at least 1 numeric character</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: hasSpecial ? '#5E33BF' : (isDark ? '#888888' : '#666666') }}>
              {hasSpecial ? '✓' : '•'}
            </span>
            <span>Password should have at least 1 special character from !@#$%^*()~`&#123;&#125;[]|\&amp;_</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginLeft: '140px', display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <button
            type="button"
            onClick={handleSetPassword}
            style={{
              height: '28px',
              padding: '0 12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              border: `1px solid ${borderColor}`,
              borderRadius: '2px',
              backgroundColor: isDark ? '#1C1C1C' : '#EAEAE5',
              color: textColor,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5E33BF';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = '#5E33BF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#1C1C1C' : '#EAEAE5';
              e.currentTarget.style.color = textColor;
              e.currentTarget.style.borderColor = borderColor;
            }}
          >
            Set Password
          </button>

          <button
            type="button"
            onClick={handleGetCurrentPassword}
            style={{
              height: '28px',
              padding: '0 12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              border: `1px solid ${borderColor}`,
              borderRadius: '2px',
              backgroundColor: isDark ? '#1C1C1C' : '#EAEAE5',
              color: textColor,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5E33BF';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = '#5E33BF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#1C1C1C' : '#EAEAE5';
              e.currentTarget.style.color = textColor;
              e.currentTarget.style.borderColor = borderColor;
            }}
          >
            Get Current Password
          </button>
        </div>

        {/* Current Password reveal box if requested */}
        {currentPasswordRevealed && (
          <div
            style={{
              marginLeft: '140px',
              padding: '8px 12px',
              border: '1px solid #5E33BF',
              borderRadius: '2px',
              backgroundColor: lightGreyBg,
              fontSize: '0.85rem',
              color: textColor,
              maxWidth: '420px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <strong>Current Password:</strong>{' '}
              <span style={{ fontFamily: 'monospace', fontSize: '0.92rem' }}>
                {currentPasswordRevealed}
              </span>
            </div>
            <button
              type="button"
              className="wsu-copy-btn"
              onClick={() => {
                if (navigator.clipboard) navigator.clipboard.writeText(currentPasswordRevealed);
                if (onShowToast) onShowToast('Current password copied');
              }}
              style={{
                backgroundColor: '#5E33BF',
                color: '#FFFFFF'
              }}
            >
              Copy
            </button>
          </div>
        )}

        {/* Status notification */}
        {passwordStatus && (
          <div
            style={{
              marginLeft: '140px',
              padding: '8px 12px',
              border: '1px solid #5E33BF',
              borderRadius: '2px',
              backgroundColor: isDark ? '#141414' : '#F0F0EB',
              fontSize: '0.84rem',
              color: textColor,
              maxWidth: '480px'
            }}
          >
            {passwordStatus.message}
          </div>
        )}
      </div>

      {/* 4. Password Reset URL Section */}
      <div style={{ marginTop: '24px', borderTop: `1px solid ${isDark ? '#333333' : '#D5D5D0'}`, paddingTop: '18px' }}>
        <h2
          style={{
            fontSize: '0.98rem',
            fontWeight: 700,
            color: textColor,
            margin: '0 0 14px 0'
          }}
        >
          Password Reset URL:
        </h2>

        <form onSubmit={handleGenerateResetUrl}>
          <table style={{ borderCollapse: 'collapse', marginBottom: '14px' }}>
            <tbody>
              {/* Product selector row */}
              <tr>
                <td
                  style={{
                    padding: '4px 16px 4px 0',
                    fontSize: '0.88rem',
                    color: textColor,
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  Product:
                </td>
                <td style={{ padding: '4px 0' }}>
                  <select
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    style={{
                      height: '26px',
                      padding: '2px 8px',
                      fontSize: '0.86rem',
                      border: `1px solid ${borderColor}`,
                      borderRadius: '2px',
                      backgroundColor: inputBg,
                      color: textColor,
                      fontFamily: 'inherit',
                      outline: 'none',
                      minWidth: '150px'
                    }}
                  >
                    <option value="EndNote Web">EndNote Web</option>
                    <option value="EndNote Online">EndNote Online</option>
                    <option value="EndNote Desktop">EndNote Desktop</option>
                  </select>
                </td>
              </tr>

              {/* Locale selector row */}
              <tr>
                <td
                  style={{
                    padding: '4px 16px 4px 0',
                    fontSize: '0.88rem',
                    color: textColor,
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  Locale:
                </td>
                <td style={{ padding: '4px 0' }}>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    style={{
                      height: '26px',
                      padding: '2px 8px',
                      fontSize: '0.86rem',
                      border: `1px solid ${borderColor}`,
                      borderRadius: '2px',
                      backgroundColor: inputBg,
                      color: textColor,
                      fontFamily: 'inherit',
                      outline: 'none',
                      minWidth: '150px'
                    }}
                  >
                    <option value="English">English</option>
                    <option value="Japanese">Japanese</option>
                    <option value="German">German</option>
                    <option value="French">French</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Simplified Chinese">Simplified Chinese</option>
                    <option value="Traditional Chinese">Traditional Chinese</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginLeft: '74px', marginBottom: '14px' }}>
            <button
              type="submit"
              style={{
                height: '28px',
                padding: '0 12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                border: `1px solid ${borderColor}`,
                borderRadius: '2px',
                backgroundColor: isDark ? '#1C1C1C' : '#EAEAE5',
                color: textColor,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5E33BF';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = '#5E33BF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#1C1C1C' : '#EAEAE5';
                e.currentTarget.style.color = textColor;
                e.currentTarget.style.borderColor = borderColor;
              }}
            >
              Get Password Reset URL
            </button>
          </div>
        </form>

        {/* Display Generated Reset URL - matching screenshot exactly */}
        {resetUrl && (
          <div
            style={{
              marginTop: '22px',
              fontSize: '0.86rem',
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'normal',
              color: textColor,
              wordBreak: 'break-all',
              lineHeight: 1.6,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}
          >
            <span style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'normal' }}>
              Reset URL for {customerEmail.trim() || 'padmanabharoy@gmail.com'} :{' '}
              <a
                href={resetUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'normal',
                  color: isDark ? '#D1C4E9' : '#000000',
                  textDecoration: 'none'
                }}
              >
                {resetUrl}
              </a>
            </span>
            <button
              type="button"
              className="wsu-copy-btn"
              onClick={handleCopyUrl}
              title="Copy Reset URL"
              style={{
                backgroundColor: '#5E33BF',
                color: '#FFFFFF',
                height: '20px',
                padding: '0 8px',
                fontSize: '0.68rem',
                flexShrink: 0
              }}
            >
              {urlCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {/* System Footer Strip */}
      <div
        style={{
          borderTop: `1px solid ${isDark ? '#333333' : '#5E33BF'}`,
          paddingTop: '14px',
          marginTop: '36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.82rem',
          color: textColor
        }}
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#5E33BF',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 700
          }}
          onClick={() => onShowToast && onShowToast('Error report dialog opened')}
        >
          Report an Error
        </button>
        <div style={{ fontStyle: 'italic', fontWeight: 600 }}>
          lookup.pl version 2.3.0. Page generated in 0.0021 seconds
        </div>
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
