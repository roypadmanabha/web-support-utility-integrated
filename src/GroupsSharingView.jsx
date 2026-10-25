import React, { useState } from 'react';

// Strict Clarivate brand colors:
// #5E33BF (Clarivate Purple), #F0F0EB (Off-white), #000000 (Black)

export default function GroupsSharingView({ theme = 'light', onShowToast }) {
  const isDark =
    theme === 'dark' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark');

  const [customerEmail, setCustomerEmail] = useState('padmanabharoy@gmail.com');
  const [hasQueried, setHasQueried] = useState(true);
  const [sharingData, setSharingData] = useState(null);

  // Search history for email
  const [emailHistory] = useState([
    'padmanabharoy@gmail.com',
    'john.t.muller@questdiagnostics.com',
    'mario.beaudoin@uqtr.ca',
    'dennis.jones@us.dlapiper.com',
    'support.endnote@clarivate.com'
  ]);
  const [showHistory, setShowHistory] = useState(false);

  const handleGetGroups = (e) => {
    if (e) e.preventDefault();
    const email = customerEmail.trim();
    if (!email) {
      if (onShowToast) onShowToast('Please enter a customer email');
      return;
    }

    setHasQueried(true);
    // In legacy screenshot: "User is not sharing nor subscribing to any groups."
    // For test cases, if email has 'share', we could show groups, otherwise default to legacy message
    if (email.toLowerCase().includes('share') || email.toLowerCase().includes('clarivate')) {
      setSharingData({
        sharedGroups: [
          { name: 'Research_Core_2026', owner: email, members: 4, permission: 'Read & Write' },
          { name: 'Oncology_MetaAnalysis', owner: email, members: 12, permission: 'Read Only' }
        ],
        subscribedGroups: [
          { name: 'Clarivate_Global_Team', owner: 'admin@clarivate.com', permission: 'Read Only' }
        ]
      });
    } else {
      setSharingData(null);
    }

    if (onShowToast) onShowToast(`Checked Groups Sharing for ${email}`);
  };

  const textColor = isDark ? '#FFFFFF' : '#000000';
  const inputBg = isDark ? '#000000' : '#FFFFFF';
  const borderColor = isDark ? '#5E33BF' : '#000000';

  return (
    <div
      style={{
        width: '100%',
        fontFamily: "Arial, Helvetica, sans-serif",
        color: textColor,
        backgroundColor: isDark ? '#000000' : '#F0F0EB'
      }}
    >
      {/* Title matching Screenshot 1 */}
      <h1
        style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          color: textColor,
          margin: '0 0 24px 0',
          letterSpacing: '-0.2px'
        }}
      >
        Groups Sharing
      </h1>

      {/* Input row matching Screenshot 1 */}
      <form
        onSubmit={handleGetGroups}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '26px',
          flexWrap: 'wrap'
        }}
      >
        <label
          htmlFor="groups-sharing-email"
          style={{
            fontSize: '0.9rem',
            color: textColor,
            fontWeight: 500
          }}
        >
          Customer email:
        </label>

        <div style={{ position: 'relative' }}>
          <input
            id="groups-sharing-email"
            type="text"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            style={{
              width: '320px',
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

          {/* Autocomplete dropdown for last 5 searches */}
          {showHistory && emailHistory.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '30px',
                left: 0,
                width: '320px',
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
        </div>

        <button
          type="submit"
          style={{
            height: '28px',
            padding: '0 12px',
            fontSize: '0.86rem',
            fontWeight: 500,
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
          Get Groups Sharing
        </button>
      </form>

      {/* Result message matching Screenshot 1 */}
      {hasQueried && !sharingData && (
        <div
          style={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: textColor,
            marginTop: '10px'
          }}
        >
          User is not sharing nor subscribing to any groups.
        </div>
      )}

      {/* When user has groups sharing */}
      {hasQueried && sharingData && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px', color: textColor }}>
            Shared Groups owned by {customerEmail}:
          </div>
          <table
            style={{
              width: '100%',
              maxWidth: '750px',
              borderCollapse: 'collapse',
              marginBottom: '20px',
              fontSize: '0.85rem'
            }}
          >
            <thead>
              <tr style={{ borderBottom: `2px solid ${textColor}`, textAlign: 'left' }}>
                <th style={{ padding: '6px 10px' }}>Group Name</th>
                <th style={{ padding: '6px 10px' }}>Owner</th>
                <th style={{ padding: '6px 10px' }}>Members</th>
                <th style={{ padding: '6px 10px' }}>Permissions</th>
              </tr>
            </thead>
            <tbody>
              {sharingData.sharedGroups.map((g, idx) => (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: idx % 2 === 0 ? (isDark ? '#000000' : '#FFFFFF') : (isDark ? '#565656' : 'lightgrey'),
                    borderBottom: '1px solid rgba(0,0,0,0.06)'
                  }}
                >
                  <td style={{ padding: '6px 10px' }}>{g.name}</td>
                  <td style={{ padding: '6px 10px' }}>{g.owner}</td>
                  <td style={{ padding: '6px 10px' }}>{g.members}</td>
                  <td style={{ padding: '6px 10px' }}>{g.permission}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px', color: textColor }}>
            Subscribed Groups:
          </div>
          <table
            style={{
              width: '100%',
              maxWidth: '750px',
              borderCollapse: 'collapse',
              fontSize: '0.85rem'
            }}
          >
            <thead>
              <tr style={{ borderBottom: `2px solid ${textColor}`, textAlign: 'left' }}>
                <th style={{ padding: '6px 10px' }}>Group Name</th>
                <th style={{ padding: '6px 10px' }}>Owner</th>
                <th style={{ padding: '6px 10px' }}>Permissions</th>
              </tr>
            </thead>
            <tbody>
              {sharingData.subscribedGroups.map((g, idx) => (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: idx % 2 === 0 ? (isDark ? '#000000' : '#FFFFFF') : (isDark ? '#565656' : 'lightgrey'),
                    borderBottom: '1px solid rgba(0,0,0,0.06)'
                  }}
                >
                  <td style={{ padding: '6px 10px' }}>{g.name}</td>
                  <td style={{ padding: '6px 10px' }}>{g.owner}</td>
                  <td style={{ padding: '6px 10px' }}>{g.permission}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${isDark ? '#333333' : '#5E33BF'}`,
          paddingTop: '14px',
          marginTop: '44px',
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
          lookup.pl version 2.3.0. Page generated in 0.0019 seconds
        </div>
      </div>
    </div>
  );
}
