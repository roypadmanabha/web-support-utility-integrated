import React, { useState, useEffect, useMemo } from 'react';
import { useUndoableInputs } from './useUndoableInputs';

// Strict Clarivate brand colors only:
// #5E33BF (Clarivate Purple), #F0F0EB (Off-white), #000000 (Black)

const SAMPLE_SESSIONS = [
  {
    authToken: 'i-0fd0055ab3e0ad942:h6fQ4ZiuSRKHCTj1KS85kw',
    uid: 'amxgngrsDoAAJONnSDw',
    clientName: 'EndNote 2025.4 Mac',
    dateCreated: '2026-10-25 07:24:53.0'
  },
  {
    authToken: 'i-06fd0055ab3e0ad942:aT8YJVvBRRWh-CTxQvdNYw',
    uid: 'amxgngrsDoAAJONnSDw',
    clientName: 'EndNote 2025.4 Mac',
    dateCreated: '2026-10-25 07:24:53.0'
  },
  {
    authToken: 'i-0ee4e139ffbfc8061:H1trEvNURKiHwkzuxxSnPA',
    uid: 'amxgngrsDoAAJONnSDw',
    clientName: 'EndNote 2025.4 Mac',
    dateCreated: '2026-10-25 06:55:43.0'
  },
  {
    authToken: 'i-00aa7070b34ccab21:Dy-dgTzoTPCE2-P0vD4jBg',
    uid: 'amxgngrsDoAAJONnSDw',
    clientName: 'EndNote 2025.4 Mac',
    dateCreated: '2026-10-25 06:45:26.0'
  },
  {
    authToken: 'i-0ca681d62adb70033:BxfNbBTuTZS_MFNDtV-UNg',
    uid: 'amxgngrsDoAAJONnSDw',
    clientName: 'EndNote 2025.4 Mac',
    dateCreated: '2026-10-25 06:45:20.0'
  },
  {
    authToken: 'i-0b366a931c0098cc7:mZu2LDQfTuUEeUhO0sxsKA',
    uid: 'amxgngrsDoAAJONnSDw',
    clientName: 'EndNote 2025.4 Mac',
    dateCreated: '2026-10-25 06:45:19.0'
  },
  {
    authToken: 'i-048b60883fa0bda34:5Z7SlP08TKkHRmVS4ovGA',
    uid: 'amxgngrsDoAAJONnSDw',
    clientName: 'EndNote 2025.4 Mac',
    dateCreated: '2026-10-25 06:45:00.0'
  },
  {
    authToken: 'i-0fd0055ab3e0ad942:8v6D4wPkTTuFixWA18kbPQ',
    uid: 'amxgngrsDoAAJONnSDw',
    clientName: 'EndNote 2025.4 Mac',
    dateCreated: '2026-10-25 06:44:58.0'
  },
  {
    authToken: 'i-0cf71cdb2b481edc4:HPouvyyEQzqC3XnLdpw4xQ',
    uid: 'amxgngrsDoAAJONnSDw',
    clientName: 'EndNote 2025.4 Mac',
    dateCreated: '2026-10-25 06:44:58.0'
  },
  {
    authToken: 'i-0753156a482e427be:XpHserg4QTiNPkKliYM-_g',
    uid: 'amxgngrsDoAAJONnSDw',
    clientName: 'EndNote 2025.4 Mac',
    dateCreated: '2026-10-24 10:37:31.0'
  },
  {
    authToken: 'i-083a6dd8fe80dcaeb:s_X4hE7XQuuP1flRXRb_pQ',
    uid: 'amxgngrsDoAAJONnSDw',
    clientName: 'EndNote 2025.4 Mac',
    dateCreated: '2026-10-24 10:37:31.0'
  },
  {
    authToken: 'i-053836a7d7d09a3d3:TAp_hV5XSmCckb5sLKK0AA',
    uid: 'amxgngrsDoAAJONnSDw',
    clientName: 'EndNote 2025.4 Mac',
    dateCreated: '2026-10-24 10:36:57.0'
  },
  {
    authToken: 'i-012ab994c928fa812:Kx89PqmNZtr18AAb8931AA',
    uid: 'amxgngrsDoAAJONnSDw',
    clientName: 'EndNote 2025.4 Windows',
    dateCreated: '2026-10-24 09:12:15.0'
  },
  {
    authToken: 'i-088c42b017a4ea119:Vv88KkaLpq821Mna0193bb',
    uid: 'amxgngrsDoAAJONnSDw',
    clientName: 'EndNote Web Online',
    dateCreated: '2026-10-23 15:40:02.0'
  },
  {
    authToken: 'i-044ff9910e1189ac3:Zz910OpqL9921Kkn8831cc',
    uid: 'amxgngrsDoAAJONnSDw',
    clientName: 'EndNote 2025.4 Mac',
    dateCreated: '2026-10-23 11:22:48.0'
  }
];

export default function UserAccessLookupView({ theme = 'light', onShowToast }) {
  const isDark =
    theme === 'dark' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark');

  const [emailInput, setEmailInput] = useState('padmanabharoy@gmail.com');
  const [uidInput, setUidInput] = useState('');
  const [activeSessionUser, setActiveSessionUser] = useState('padmanabharoy@gmail.com');
  const [showEntries, setShowEntries] = useState(25);
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const [emailWasCopied, setEmailWasCopied] = useState(false);
  const [uidWasCopied, setUidWasCopied] = useState(false);

  useEffect(() => {
    setEmailWasCopied(false);
  }, [emailInput]);

  useEffect(() => {
    setUidWasCopied(false);
  }, [uidInput]);

  const isEmailCopyMode = Boolean(emailInput && emailInput.trim().length > 0 && !emailWasCopied);
  const isUidCopyMode = Boolean(uidInput && uidInput.trim().length > 0 && !uidWasCopied);

  const { clearField, undoField, canUndo, registerRef } = useUndoableInputs(
    {
      email: setEmailInput,
      uid: setUidInput,
      filter: setFilterQuery
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
      handlePaste((val) => {
        setEmailInput(val);
        setEmailWasCopied(false);
      }, 'Email');
    }
  };

  const handleUidCopyOrPaste = () => {
    if (isUidCopyMode) {
      handleCopy(uidInput, 'uid', 'UID');
      setUidWasCopied(true);
    } else {
      handlePaste((val) => {
        setUidInput(val);
        setUidWasCopied(false);
      }, 'UID');
    }
  };

  const handleSearchByEmail = (e) => {
    if (e) e.preventDefault();
    const val = emailInput.trim();
    if (!val) {
      if (onShowToast) onShowToast('Please enter an email to search.');
      return;
    }
    setActiveSessionUser(val);
    if (!uidInput) setUidInput('amxgngrsDoAAJONnSDw');
    if (onShowToast) onShowToast(`Showing EN Services auth sessions for ${val}`);
  };

  const handleSearchByUid = (e) => {
    if (e) e.preventDefault();
    const val = uidInput.trim();
    if (!val) {
      if (onShowToast) onShowToast('Please enter a UID to search.');
      return;
    }
    setActiveSessionUser(`UID: ${val}`);
    if (onShowToast) onShowToast(`Showing EN Services auth sessions for UID ${val}`);
  };

  const filteredSessions = useMemo(() => {
    if (!filterQuery.trim()) return SAMPLE_SESSIONS;
    const q = filterQuery.toLowerCase().trim();
    return SAMPLE_SESSIONS.filter(
      (s) =>
        s.authToken.toLowerCase().includes(q) ||
        s.uid.toLowerCase().includes(q) ||
        s.clientName.toLowerCase().includes(q) ||
        s.dateCreated.toLowerCase().includes(q)
    );
  }, [filterQuery]);

  const displayedSessions = filteredSessions.slice(0, Number(showEntries));

  return (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        color: isDark ? '#FFFFFF' : '#000000'
      }}
    >
      {/* Page Title & Subtitle matching Screenshot 1 */}
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          margin: '0 0 16px 0',
          color: isDark ? '#FFFFFF' : '#000000'
        }}
      >
        User Access Lookup
      </h1>

      <p
        style={{
          fontSize: '0.86rem',
          fontWeight: 700,
          margin: '0 0 20px 0',
          color: isDark ? '#FFFFFF' : '#000000'
        }}
      >
        Displays the 100 most recent EN Services Auth Tokens
      </p>

      {/* Input Form with Copy & Clear buttons */}
      <div style={{ marginBottom: '28px', maxWidth: '780px' }}>
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
            onClick={() => clearField('email', emailInput, 'Email')}
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
            onClick={handleSearchByEmail}
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
            Search By Email
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
              width: '70px',
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
            onClick={() => clearField('uid', uidInput, 'UID')}
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
            onClick={handleSearchByUid}
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
            Search By UID
          </button>
        </div>
      </div>

      {/* 100 Most Recent Sessions for <User> Section Header */}
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          margin: '0 0 16px 0',
          color: isDark ? '#FFFFFF' : '#000000'
        }}
      >
        100 Most Recent Sessions for {activeSessionUser}
      </h2>

      {/* Table controls row: Show X entries & Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}>
          <span>Show</span>
          <select
            value={showEntries}
            onChange={(e) => setShowEntries(e.target.value)}
            style={{
              height: '26px',
              padding: '0 6px',
              border: '1px solid #5E33BF',
              borderRadius: '2px',
              backgroundColor: isDark ? '#000000' : '#FFFFFF',
              color: isDark ? '#FFFFFF' : '#000000',
              fontFamily: 'inherit',
              fontWeight: 600
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Search:</span>
          <input
            ref={registerRef('filter')}
            data-field="filter"
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            onKeyDown={(e) => {
              const isCtrlOrMeta = e.ctrlKey || e.metaKey;
              const k = e.key ? e.key.toLowerCase() : '';
              if (isCtrlOrMeta && (k === 'z' || k === 'u')) {
                e.preventDefault();
                undoField('filter', 'Search Filter');
              }
            }}
            style={{
              width: '180px',
              height: '26px',
              padding: '2px 8px',
              fontSize: '0.82rem',
              border: '1px solid #5E33BF',
              borderRadius: '2px',
              backgroundColor: isDark ? '#000000' : '#FFFFFF',
              color: isDark ? '#FFFFFF' : '#000000',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => clearField('filter', filterQuery, 'Search Filter')}
              title="Clear search filter (Ctrl+Z or U to return back)"
              style={{
                height: '26px',
                padding: '0 8px',
                backgroundColor: '#5E33BF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '2px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Clear
            </button>
          )}

        </div>
      </div>

      {/* Table matching Screenshot 1 */}
      <div
        style={{
          border: '1px solid #5E33BF',
          borderRadius: '4px',
          overflowX: 'auto',
          backgroundColor: isDark ? '#000000' : '#FFFFFF'
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.82rem',
            textAlign: 'left'
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: isDark ? '#000000' : '#F0F0EB',
                borderBottom: '1px solid #5E33BF',
                color: isDark ? '#FFFFFF' : '#000000',
                fontWeight: 700
              }}
            >
              <th style={{ padding: '8px 12px' }}>Auth Token</th>
              <th style={{ padding: '8px 12px' }}>UID</th>
              <th style={{ padding: '8px 12px' }}>Client Name</th>
              <th style={{ padding: '8px 12px' }}>Date Created</th>
            </tr>
          </thead>
          <tbody>
            {displayedSessions.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: isDark ? '#A0A0A0' : '#666666',
                    fontStyle: 'italic'
                  }}
                >
                  No session records matching filter.
                </td>
              </tr>
            ) : (
              displayedSessions.map((row, idx) => {
                const isEven = idx % 2 === 0;
                const rowBg = isDark
                  ? isEven
                    ? '#000000'
                    : '#565656'
                  : isEven
                  ? '#FFFFFF'
                  : 'lightgrey';
                const rowColor = isDark ? '#FFFFFF' : '#000000';

                return (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: rowBg,
                      color: rowColor,
                      borderBottom: isDark ? '1px solid #333333' : '1px solid #E0E0E0'
                    }}
                  >
                    <td style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {row.authToken}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(row.authToken, `row-${idx}-token`, 'Token')}
                          style={{
                            height: '20px',
                            padding: '0 6px',
                            backgroundColor: '#5E33BF',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '2px',
                            fontSize: '0.68rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                        >
                          {copiedKey === `row-${idx}-token` ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            color: '#5E33BF',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                          onClick={() => {
                            setUidInput(row.uid);
                            if (onShowToast) onShowToast(`Selected UID ${row.uid}`);
                          }}
                        >
                          {row.uid}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(row.uid, `row-${idx}-uid`, 'UID')}
                          style={{
                            height: '20px',
                            padding: '0 6px',
                            backgroundColor: '#5E33BF',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '2px',
                            fontSize: '0.68rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                        >
                          {copiedKey === `row-${idx}-uid` ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '6px 12px' }}>{row.clientName}</td>
                    <td style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}>
                      {row.dateCreated}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: '10px',
          fontSize: '0.8rem',
          color: isDark ? '#A0A0A0' : '#666666',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <span>
          Showing 1 to {Math.min(displayedSessions.length, Number(showEntries))} of{' '}
          {SAMPLE_SESSIONS.length} entries
        </span>
      </div>
    </div>
  );
}
