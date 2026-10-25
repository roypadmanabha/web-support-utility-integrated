import React, { useState, useEffect } from 'react';
import { useUndoableInputs } from './useUndoableInputs';

// Strict Clarivate brand colors only:
// #5E33BF (Clarivate Purple), #F0F0EB (Off-white), #000000 (Black)

export default function EndNoteOnlineAccessView({ theme = 'light', onShowToast }) {
  const isDark =
    theme === 'dark' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark');

  const [emailInput, setEmailInput] = useState('padmanabharoy@gmail.com');
  const [uidInput, setUidInput] = useState('');
  const [ipInput, setIpInput] = useState('10.240.18.92');
  const [sidInput, setSidInput] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(null);

  const [emailWasCopied, setEmailWasCopied] = useState(false);
  const [uidWasCopied, setUidWasCopied] = useState(false);
  const [ipWasCopied, setIpWasCopied] = useState(false);
  const [sidWasCopied, setSidWasCopied] = useState(false);

  useEffect(() => { setEmailWasCopied(false); }, [emailInput]);
  useEffect(() => { setUidWasCopied(false); }, [uidInput]);
  useEffect(() => { setIpWasCopied(false); }, [ipInput]);
  useEffect(() => { setSidWasCopied(false); }, [sidInput]);

  const isEmailCopyMode = Boolean(emailInput && emailInput.trim().length > 0 && !emailWasCopied);
  const isUidCopyMode = Boolean(uidInput && uidInput.trim().length > 0 && !uidWasCopied);
  const isIpCopyMode = Boolean(ipInput && ipInput.trim().length > 0 && !ipWasCopied);
  const isSidCopyMode = Boolean(sidInput && sidInput.trim().length > 0 && !sidWasCopied);

  const { clearField, undoField, canUndo, registerRef } = useUndoableInputs(
    {
      email: setEmailInput,
      uid: setUidInput,
      ip: setIpInput,
      sid: setSidInput
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

  const handlePaste = (setter, label) => {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then((text) => {
        if (text) {
          setter(text);
          if (onShowToast) onShowToast(`Pasted into ${label}`);
        }
      }).catch(() => {});
    }
  };

  const handleEmailCopyOrPaste = () => {
    if (isEmailCopyMode) {
      handleCopy(emailInput, 'email', 'Email');
      setEmailWasCopied(true);
    } else {
      handlePaste((val) => { setEmailInput(val); setEmailWasCopied(false); }, 'Email');
    }
  };

  const handleUidCopyOrPaste = () => {
    if (isUidCopyMode) {
      handleCopy(uidInput, 'uid', 'UID');
      setUidWasCopied(true);
    } else {
      handlePaste((val) => { setUidInput(val); setUidWasCopied(false); }, 'UID');
    }
  };

  const handleIpCopyOrPaste = () => {
    if (isIpCopyMode) {
      handleCopy(ipInput, 'ip', 'IP');
      setIpWasCopied(true);
    } else {
      handlePaste((val) => { setIpInput(val); setIpWasCopied(false); }, 'IP');
    }
  };

  const handleSidCopyOrPaste = () => {
    if (isSidCopyMode) {
      handleCopy(sidInput, 'sid', 'SID');
      setSidWasCopied(true);
    } else {
      handlePaste((val) => { setSidInput(val); setSidWasCopied(false); }, 'SID');
    }
  };

  const handleAccessByEmail = (e) => {
    if (e) e.preventDefault();
    const email = emailInput.trim();
    if (!email) {
      setSessionStatus({ type: 'error', message: 'Please enter an Email.' });
      return;
    }
    setUidInput('amxgngrsDoAAJONnSDw');
    const genSid = 'SID-ENW-' + Math.floor(100000 + Math.random() * 900000) + '-AUTH';
    setSidInput(genSid);
    setSessionStatus({
      type: 'success',
      message: `Active user mapped for ${email}. Resolved UID and generated SID.`
    });
    if (onShowToast) onShowToast(`Resolved UID and SID for ${email}`);
  };

  const handleAccessByUid = (e) => {
    if (e) e.preventDefault();
    const uid = uidInput.trim();
    if (!uid) {
      setSessionStatus({ type: 'error', message: 'Please enter a UID.' });
      return;
    }
    setEmailInput('padmanabharoy@gmail.com');
    const genSid = 'SID-ENW-' + Math.floor(100000 + Math.random() * 900000) + '-AUTH';
    setSidInput(genSid);
    setSessionStatus({
      type: 'success',
      message: `Session resolved for UID ${uid}. Email and SID mapped.`
    });
    if (onShowToast) onShowToast(`Resolved session for UID ${uid}`);
  };

  const handleGetSid = () => {
    const genSid = 'SID-IP-' + Math.floor(100000 + Math.random() * 900000) + '-V2';
    setSidInput(genSid);
    if (onShowToast) onShowToast(`Generated Session ID: ${genSid}`);
  };

  const handleClearSid = () => {
    setSidInput('');
    if (onShowToast) onShowToast('Cleared Session ID (SID)');
  };

  const handleGoToEndNoteOnline = () => {
    const url = 'https://www.myendnoteweb.com/EndNoteWeb.html';
    window.open(url, '_blank', 'noopener,noreferrer');
    if (onShowToast) onShowToast('Launching EndNote Online session...');
  };

  return (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        color: isDark ? '#FFFFFF' : '#000000'
      }}
    >
      {/* Title matching Screenshot 4 */}
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          margin: '0 0 24px 0',
          color: isDark ? '#FFFFFF' : '#000000'
        }}
      >
        Access to EndNote Online
      </h1>

      <div style={{ maxWidth: '840px', marginBottom: '24px' }}>
        {/* Email Row */}
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
              width: '120px',
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
            type="button"
            onClick={handleAccessByEmail}
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

        {/* UID Row */}
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
              width: '120px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: isDark ? '#FFFFFF' : '#000000'
            }}
          >
            UID:
          </label>
          <input
            ref={registerRef('uid')}
            data-field="uid"
            type="text"
            value={uidInput}
            onChange={(e) => setUidInput(e.target.value)}
            onKeyDown={(e) => {
              const isCtrlOrMeta = e.ctrlKey || e.metaKey;
              const k = e.key ? e.key.toLowerCase() : '';
              if (isCtrlOrMeta && (k === 'z' || k === 'u')) {
                e.preventDefault();
                undoField('uid', 'UID');
              }
            }}
            placeholder="e.g. amxgngrsDoAAJONnSDw"
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
            onClick={handleUidCopyOrPaste}
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
            {isUidCopyMode ? 'Copy' : 'Paste'}
          </button>
          <button
            type="button"
            onClick={() => {
              clearField('uid', uidInput, 'UID');
              setUidWasCopied(false);
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
            type="button"
            onClick={handleAccessByUid}
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
            Access By UID
          </button>
        </div>

        {/* IP Row */}
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
              width: '120px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: isDark ? '#FFFFFF' : '#000000'
            }}
          >
            IP (optional):
          </label>
          <input
            ref={registerRef('ip')}
            data-field="ip"
            type="text"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            onKeyDown={(e) => {
              const isCtrlOrMeta = e.ctrlKey || e.metaKey;
              const k = e.key ? e.key.toLowerCase() : '';
              if (isCtrlOrMeta && (k === 'z' || k === 'u')) {
                e.preventDefault();
                undoField('ip', 'IP');
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
            onClick={handleIpCopyOrPaste}
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
            {isIpCopyMode ? 'Copy' : 'Paste'}
          </button>
          <button
            type="button"
            onClick={() => {
              clearField('ip', ipInput, 'IP');
              setIpWasCopied(false);
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
            type="button"
            onClick={handleGetSid}
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
            Get SID
          </button>
        </div>

        {/* SID Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <label
            style={{
              width: '120px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: isDark ? '#FFFFFF' : '#000000'
            }}
          >
            SID (optional):
          </label>
          <input
            ref={registerRef('sid')}
            data-field="sid"
            type="text"
            value={sidInput}
            onChange={(e) => setSidInput(e.target.value)}
            onKeyDown={(e) => {
              const isCtrlOrMeta = e.ctrlKey || e.metaKey;
              const k = e.key ? e.key.toLowerCase() : '';
              if (isCtrlOrMeta && (k === 'z' || k === 'u')) {
                e.preventDefault();
                undoField('sid', 'SID');
              }
            }}
            placeholder="Click 'Get SID' or paste"
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
            onClick={handleSidCopyOrPaste}
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
            {isSidCopyMode ? 'Copy' : 'Paste'}
          </button>
          <button
            type="button"
            onClick={() => {
              clearField('sid', sidInput, 'SID');
              setSidWasCopied(false);
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
            type="button"
            onClick={handleClearSid}
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
            Clear SID
          </button>
        </div>

        {/* Go to EndNote Online Button matching Screenshot 4 */}
        <div style={{ marginTop: '16px' }}>
          <button
            type="button"
            onClick={handleGoToEndNoteOnline}
            style={{
              height: '32px',
              padding: '0 18px',
              backgroundColor: '#5E33BF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '2px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Go to EndNote Online
          </button>
        </div>

        {sessionStatus && (
          <div
            style={{
              marginTop: '16px',
              padding: '10px 14px',
              border: '1px solid #5E33BF',
              borderRadius: '2px',
              fontSize: '0.82rem',
              color: '#5E33BF',
              fontWeight: 600
            }}
          >
            {sessionStatus.message}
          </div>
        )}
      </div>
    </div>
  );
}
