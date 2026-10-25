import React, { useState, useEffect } from 'react';
import { useUndoableInputs } from './useUndoableInputs';

// Strict Clarivate brand colors only:
// #5E33BF (Clarivate Purple), #F0F0EB (Off-white), #000000 (Black)

export default function AggregateAccessLookupView({ theme = 'light', onShowToast }) {
  const isDark =
    theme === 'dark' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark');

  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-25');
  const [aggregateResult, setAggregateResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const [startDateWasCopied, setStartDateWasCopied] = useState(false);
  const [endDateWasCopied, setEndDateWasCopied] = useState(false);

  useEffect(() => {
    setStartDateWasCopied(false);
  }, [startDate]);

  useEffect(() => {
    setEndDateWasCopied(false);
  }, [endDate]);

  const isStartDateCopyMode = Boolean(startDate && startDate.trim().length > 0 && !startDateWasCopied);
  const isEndDateCopyMode = Boolean(endDate && endDate.trim().length > 0 && !endDateWasCopied);

  const { clearField, undoField, canUndo, registerRef } = useUndoableInputs(
    {
      startDate: setStartDate,
      endDate: setEndDate
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

  const handleStartDateCopyOrPaste = () => {
    if (isStartDateCopyMode) {
      handleCopy(startDate, 'start-date', 'Start Date');
      setStartDateWasCopied(true);
    } else {
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then((text) => {
          if (text) {
            setStartDateInput(text);
            setStartDateWasCopied(false);
            if (onShowToast) onShowToast('Pasted into Start Date');
          }
        }).catch(() => {});
      }
    }
  };

  const handleEndDateCopyOrPaste = () => {
    if (isEndDateCopyMode) {
      handleCopy(endDate, 'end-date', 'End Date');
      setEndDateWasCopied(true);
    } else {
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then((text) => {
          if (text) {
            setEndDateInput(text);
            setEndDateWasCopied(false);
            if (onShowToast) onShowToast('Pasted into End Date');
          }
        }).catch(() => {});
      }
    }
  };

  const handleSearchAllAccess = () => {
    setAggregateResult({
      type: 'all',
      title: 'Global EN Services Lifetime Aggregate Usage',
      totalRequests: '48,912,402',
      uniqueUsers: '382,910',
      activeDesktopUsers: '241,800',
      activeOnlineUsers: '141,110',
      syncEvents: '12,940,118',
      authTokensIssued: '4,892,100',
      avgLatencyMs: '42ms',
      uptime: '99.98%',
      clientBreakdown: [
        { client: 'EndNote Desktop 25 (Mac)', percent: '38%', count: '18,586,712' },
        { client: 'EndNote Desktop 25 (Windows)', percent: '42%', count: '20,543,208' },
        { client: 'EndNote Online Web App', percent: '15%', count: '7,336,860' },
        { client: 'EndNote iOS / iPad', percent: '5%', count: '2,445,622' }
      ]
    });
    if (onShowToast) onShowToast('Loaded lifetime aggregate EN Services usage');
  };

  const handleSearchByRange = (e) => {
    if (e) e.preventDefault();
    if (!startDate.trim() || !endDate.trim()) {
      if (onShowToast) onShowToast('Please provide both Start Date and End Date.');
      return;
    }

    setAggregateResult({
      type: 'range',
      title: `Aggregate EN Services Usage (${startDate.trim()} to ${endDate.trim()})`,
      totalRequests: '2,481,920',
      uniqueUsers: '42,810',
      activeDesktopUsers: '28,100',
      activeOnlineUsers: '14,710',
      syncEvents: '689,400',
      authTokensIssued: '210,400',
      avgLatencyMs: '38ms',
      uptime: '99.99%',
      clientBreakdown: [
        { client: 'EndNote Desktop 25 (Mac)', percent: '40%', count: '992,768' },
        { client: 'EndNote Desktop 25 (Windows)', percent: '44%', count: '1,092,044' },
        { client: 'EndNote Online Web App', percent: '12%', count: '297,830' },
        { client: 'EndNote iOS / iPad', percent: '4%', count: '99,278' }
      ]
    });
    if (onShowToast) onShowToast(`Generated aggregate usage for ${startDate} to ${endDate}`);
  };

  return (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        color: isDark ? '#FFFFFF' : '#000000'
      }}
    >
      {/* Title matching Screenshot 2 */}
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          margin: '0 0 24px 0',
          color: isDark ? '#FFFFFF' : '#000000'
        }}
      >
        Aggregate Access Lookup
      </h1>

      {/* Section 1: All Access */}
      <div style={{ marginBottom: '28px' }}>
        <p
          style={{
            fontSize: '0.9rem',
            margin: '0 0 10px 0',
            color: isDark ? '#FFFFFF' : '#000000'
          }}
        >
          Produces an aggregate of all EN Services usage.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>All Access:</span>
          <button
            type="button"
            onClick={handleSearchAllAccess}
            style={{
              height: '30px',
              padding: '0 14px',
              backgroundColor: '#5E33BF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '2px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Search All Access Data
          </button>
        </div>
      </div>

      {/* Section 2: Range Lookup */}
      <div style={{ marginBottom: '28px' }}>
        <p
          style={{
            fontSize: '0.9rem',
            margin: '0 0 14px 0',
            color: isDark ? '#FFFFFF' : '#000000'
          }}
        >
          Produces an aggregate of all EN Services usage for a range of time.
        </p>

        <form onSubmit={handleSearchByRange} style={{ maxWidth: '820px' }}>
          {/* Start Date Row */}
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
                width: '260px',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: isDark ? '#FFFFFF' : '#000000'
              }}
            >
              Start Date (Format = YYYY-MM-DD):
            </label>
            <input
              ref={registerRef('startDate')}
              data-field="startDate"
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onKeyDown={(e) => {
                const isCtrlOrMeta = e.ctrlKey || e.metaKey;
                const k = e.key ? e.key.toLowerCase() : '';
                if (isCtrlOrMeta && (k === 'z' || k === 'u')) {
                  e.preventDefault();
                  undoField('startDate', 'Start Date');
                }
              }}
              placeholder="YYYY-MM-DD"
              style={{
                width: '240px',
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
              onClick={handleStartDateCopyOrPaste}
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
              {isStartDateCopyMode ? 'Copy' : 'Paste'}
            </button>
            <button
              type="button"
              onClick={() => {
                clearField('startDate', startDate, 'Start Date');
                setStartDateWasCopied(false);
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
          </div>

          {/* End Date Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '14px',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <label
              style={{
                width: '260px',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: isDark ? '#FFFFFF' : '#000000'
              }}
            >
              End Date (Format = YYYY-MM-DD):
            </label>
            <input
              ref={registerRef('endDate')}
              data-field="endDate"
              type="text"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onKeyDown={(e) => {
                const isCtrlOrMeta = e.ctrlKey || e.metaKey;
                const k = e.key ? e.key.toLowerCase() : '';
                if (isCtrlOrMeta && (k === 'z' || k === 'u')) {
                  e.preventDefault();
                  undoField('endDate', 'End Date');
                }
              }}
              placeholder="YYYY-MM-DD"
              style={{
                width: '240px',
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
              onClick={handleEndDateCopyOrPaste}
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
              {isEndDateCopyMode ? 'Copy' : 'Paste'}
            </button>
            <button
              type="button"
              onClick={() => {
                clearField('endDate', endDate, 'End Date');
                setEndDateWasCopied(false);
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
                padding: '0 14px',
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
              Search By Range
            </button>
          </div>
        </form>
      </div>

      {/* Aggregate Output Dashboard */}
      {aggregateResult && (
        <div
          style={{
            border: '1px solid #5E33BF',
            borderRadius: '4px',
            padding: '20px',
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
            marginTop: '20px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #5E33BF',
              paddingBottom: '10px',
              marginBottom: '16px'
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
              {aggregateResult.title}
            </h3>
            <span
              style={{
                fontSize: '0.76rem',
                backgroundColor: '#5E33BF',
                color: '#FFFFFF',
                padding: '2px 8px',
                borderRadius: '2px'
              }}
            >
              Status: Active • Uptime {aggregateResult.uptime}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '20px'
            }}
          >
            <div
              style={{
                padding: '12px',
                border: '1px solid #5E33BF',
                borderRadius: '2px',
                backgroundColor: isDark ? '#000000' : '#F0F0EB'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Total API Requests</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#5E33BF' }}>
                {aggregateResult.totalRequests}
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                border: '1px solid #5E33BF',
                borderRadius: '2px',
                backgroundColor: isDark ? '#000000' : '#F0F0EB'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Unique Authenticated Users</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#5E33BF' }}>
                {aggregateResult.uniqueUsers}
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                border: '1px solid #5E33BF',
                borderRadius: '2px',
                backgroundColor: isDark ? '#000000' : '#F0F0EB'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Web Library Syncs</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#5E33BF' }}>
                {aggregateResult.syncEvents}
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                border: '1px solid #5E33BF',
                borderRadius: '2px',
                backgroundColor: isDark ? '#000000' : '#F0F0EB'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Auth Tokens Issued</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#5E33BF' }}>
                {aggregateResult.authTokensIssued}
              </div>
            </div>
          </div>

          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 700 }}>
            Traffic by Client Platform:
          </h4>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.82rem'
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: isDark ? '#000000' : '#F0F0EB',
                  borderBottom: '1px solid #5E33BF',
                  textAlign: 'left'
                }}
              >
                <th style={{ padding: '6px 10px' }}>Client</th>
                <th style={{ padding: '6px 10px' }}>Share</th>
                <th style={{ padding: '6px 10px' }}>Request Volume</th>
              </tr>
            </thead>
            <tbody>
              {aggregateResult.clientBreakdown.map((item, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: isDark ? '1px solid #333333' : '1px solid #E0E0E0',
                    backgroundColor: idx % 2 === 0 ? (isDark ? '#000000' : '#FFFFFF') : (isDark ? '#565656' : 'lightgrey')
                  }}
                >
                  <td style={{ padding: '6px 10px' }}>{item.client}</td>
                  <td style={{ padding: '6px 10px', fontWeight: 700, color: '#5E33BF' }}>
                    {item.percent}
                  </td>
                  <td style={{ padding: '6px 10px' }}>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
