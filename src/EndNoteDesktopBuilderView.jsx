import React, { useState, useEffect } from 'react';
import { useUndoableInputs } from './useUndoableInputs';

// Strict Clarivate brand colors only:
// #5E33BF (Clarivate Purple), #F0F0EB (Off-white), #000000 (Black)

export default function EndNoteDesktopBuilderView({ theme = 'light', onShowToast }) {
  const isDark =
    theme === 'dark' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark');

  const [emailInput, setEmailInput] = useState('padmanabharoy@gmail.com');
  const [uidInput, setUidInput] = useState('');
  const [maxEntries, setMaxEntries] = useState('1000');
  const [apiCalls, setApiCalls] = useState('100');
  const [enableLogs, setEnableLogs] = useState(false);
  const [product, setProduct] = useState('EN25');
  const [os, setOs] = useState('Windows');
  const [copiedKey, setCopiedKey] = useState(null);
  const [xmlContent, setXmlContent] = useState('');

  const [emailWasCopied, setEmailWasCopied] = useState(false);
  const [uidWasCopied, setUidWasCopied] = useState(false);

  useEffect(() => { setEmailWasCopied(false); }, [emailInput]);
  useEffect(() => { setUidWasCopied(false); }, [uidInput]);

  const isEmailCopyMode = Boolean(emailInput && emailInput.trim().length > 0 && !emailWasCopied);
  const isUidCopyMode = Boolean(uidInput && uidInput.trim().length > 0 && !uidWasCopied);

  const { clearField, undoField, canUndo, registerRef } = useUndoableInputs(
    {
      email: setEmailInput,
      uid: setUidInput,
      max: setMaxEntries,
      api: setApiCalls
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

  const handleAccessByEmail = (e) => {
    if (e) e.preventDefault();
    const email = emailInput.trim();
    if (!email) {
      if (onShowToast) onShowToast('Please enter an Email address');
      return;
    }
    setUidInput('amxgngrsDoAAJONnSDw');
    generateXml(email, 'amxgngrsDoAAJONnSDw');
    if (onShowToast) onShowToast(`Resolved UID and generated Settings.xml for ${email}`);
  };

  const handleAccessByUid = (e) => {
    if (e) e.preventDefault();
    const uid = uidInput.trim();
    if (!uid) {
      if (onShowToast) onShowToast('Please enter a UID');
      return;
    }
    setEmailInput('padmanabharoy@gmail.com');
    generateXml('padmanabharoy@gmail.com', uid);
    if (onShowToast) onShowToast(`Resolved Email and generated Settings.xml for UID ${uid}`);
  };

  const generateXml = (userEmail = emailInput, userUid = uidInput) => {
    const generated = `<?xml version="1.0" encoding="UTF-8"?>
<EndNoteDesktopSettings version="2.0">
  <Client>
    <Product>${product}</Product>
    <Platform>${os}</Platform>
    <BuildTimestamp>${new Date().toISOString()}</BuildTimestamp>
  </Client>
  <Authentication>
    <UserEmail>${userEmail || 'customer@organization.com'}</UserEmail>
    <UID>${userUid || 'amxgngrsDoAAJONnSDw'}</UID>
    <AuthServiceEndpoint>https://services.endnote.com/v2/auth</AuthServiceEndpoint>
  </Authentication>
  <SyncConfiguration>
    <MaxEntriesLimit>${maxEntries || '1000'}</MaxEntriesLimit>
    <ApiBatchCallsLimit>${apiCalls || '100'}</ApiBatchCallsLimit>
    <EnableDiagnosticLogging>${enableLogs ? 'true' : 'false'}</EnableDiagnosticLogging>
    <SyncIntervalSeconds>300</SyncIntervalSeconds>
    <RetryBackoffMultiplier>1.5</RetryBackoffMultiplier>
  </SyncConfiguration>
</EndNoteDesktopSettings>`;
    setXmlContent(generated);
  };

  const handleDownloadXml = () => {
    const content = xmlContent || generateXml();
    const blob = new Blob([content], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Settings_${product}_${os}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onShowToast) onShowToast(`Downloaded Settings_${product}_${os}.xml`);
  };

  return (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        color: isDark ? '#FFFFFF' : '#000000'
      }}
    >
      {/* Title matching Screenshot 5 */}
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          margin: '0 0 16px 0',
          color: isDark ? '#FFFFFF' : '#000000'
        }}
      >
        EndNote Desktop Builder
      </h1>

      <p
        style={{
          fontSize: '0.86rem',
          fontWeight: 700,
          margin: '0 0 24px 0',
          color: isDark ? '#FFFFFF' : '#000000'
        }}
      >
        EndNote Desktop Settings.xml Builder
      </p>

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
              width: '180px',
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
              width: '180px',
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

        {/* Max Entries Row */}
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
              width: '180px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: isDark ? '#FFFFFF' : '#000000'
            }}
          >
            Max Entries (1-1000):
          </label>
          <input
            ref={registerRef('max')}
            data-field="max"
            type="number"
            min="1"
            max="1000"
            value={maxEntries}
            onChange={(e) => setMaxEntries(e.target.value)}
            onKeyDown={(e) => {
              const isCtrlOrMeta = e.ctrlKey || e.metaKey;
              const k = e.key ? e.key.toLowerCase() : '';
              if (isCtrlOrMeta && (k === 'z' || k === 'u')) {
                e.preventDefault();
                undoField('max', 'Max Entries');
              }
            }}
            style={{
              width: '80px',
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
            onClick={() => handleCopy(maxEntries, 'max', 'Max Entries')}
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
            {copiedKey === 'max' ? 'Copied!' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={() => clearField('max', maxEntries, 'Max Entries')}
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

        </div>

        {/* API Calls Row */}
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
              width: '180px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: isDark ? '#FFFFFF' : '#000000'
            }}
          >
            Api Calls (1-100):
          </label>
          <input
            ref={registerRef('api')}
            data-field="api"
            type="number"
            min="1"
            max="100"
            value={apiCalls}
            onChange={(e) => setApiCalls(e.target.value)}
            onKeyDown={(e) => {
              const isCtrlOrMeta = e.ctrlKey || e.metaKey;
              const k = e.key ? e.key.toLowerCase() : '';
              if (isCtrlOrMeta && (k === 'z' || k === 'u')) {
                e.preventDefault();
                undoField('api', 'API Calls');
              }
            }}
            style={{
              width: '80px',
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
            onClick={() => handleCopy(apiCalls, 'api', 'API Calls')}
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
            {copiedKey === 'api' ? 'Copied!' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={() => clearField('api', apiCalls, 'API Calls')}
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

        </div>

        {/* Enable Logs Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
            gap: '8px'
          }}
        >
          <label
            style={{
              width: '180px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: isDark ? '#FFFFFF' : '#000000'
            }}
          >
            Enable Logs:
          </label>
          <input
            type="checkbox"
            checked={enableLogs}
            onChange={(e) => setEnableLogs(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              accentColor: '#5E33BF'
            }}
          />
        </div>

        {/* Product Dropdown Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
            gap: '8px'
          }}
        >
          <label
            style={{
              width: '180px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: isDark ? '#FFFFFF' : '#000000'
            }}
          >
            Product:
          </label>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            style={{
              width: '320px',
              height: '28px',
              padding: '2px 8px',
              fontSize: '0.84rem',
              border: '1px solid #5E33BF',
              borderRadius: '2px',
              backgroundColor: isDark ? '#000000' : '#FFFFFF',
              color: isDark ? '#FFFFFF' : '#000000',
              fontFamily: 'inherit'
            }}
          >
            <option value="EN25">EN25</option>
            <option value="EN24">EN24</option>
            <option value="EN21">EN21</option>
            <option value="EN20">EN20</option>
          </select>
        </div>

        {/* OS Dropdown Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '18px',
            gap: '8px'
          }}
        >
          <label
            style={{
              width: '180px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: isDark ? '#FFFFFF' : '#000000'
            }}
          >
            OS:
          </label>
          <select
            value={os}
            onChange={(e) => setOs(e.target.value)}
            style={{
              width: '120px',
              height: '28px',
              padding: '2px 8px',
              fontSize: '0.84rem',
              border: '1px solid #5E33BF',
              borderRadius: '2px',
              backgroundColor: isDark ? '#000000' : '#FFFFFF',
              color: isDark ? '#FFFFFF' : '#000000',
              fontFamily: 'inherit'
            }}
          >
            <option value="Windows">Windows</option>
            <option value="Mac">Mac</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => {
              generateXml();
              if (onShowToast) onShowToast('Generated EndNote Desktop Settings.xml');
            }}
            style={{
              height: '32px',
              padding: '0 16px',
              backgroundColor: '#5E33BF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '2px',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Build Settings.xml
          </button>
          {xmlContent && (
            <button
              type="button"
              onClick={handleDownloadXml}
              style={{
                height: '32px',
                padding: '0 16px',
                backgroundColor: isDark ? '#565656' : '#F0F0EB',
                color: isDark ? '#FFFFFF' : '#000000',
                border: '1px solid #000000',
                borderRadius: '2px',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.15s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Download Settings.xml
            </button>
          )}
        </div>

        {/* XML Preview Area */}
        {xmlContent && (
          <div
            style={{
              marginTop: '20px',
              border: '1px solid #5E33BF',
              borderRadius: '4px',
              padding: '16px',
              backgroundColor: isDark ? '#000000' : '#F0F0EB'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                Generated Settings.xml Preview:
              </span>
              <button
                type="button"
                onClick={() => handleCopy(xmlContent, 'xml', 'Settings.xml')}
                style={{
                  height: '24px',
                  padding: '0 10px',
                  backgroundColor: '#5E33BF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '2px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {copiedKey === 'xml' ? 'Copied XML!' : 'Copy XML'}
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                overflowX: 'auto',
                color: isDark ? '#FFFFFF' : '#000000',
                lineHeight: 1.5
              }}
            >
              {xmlContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
