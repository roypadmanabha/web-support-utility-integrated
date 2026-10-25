import React, { useState } from 'react';

// Strict Clarivate brand colors:
// #5E33BF (Clarivate Purple), #F0F0EB (Off-white), #000000 (Black)

export default function AlterReferenceDataView({ theme = 'light', onShowToast }) {
  const isDark =
    theme === 'dark' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark');

  const [customerEmail, setCustomerEmail] = useState('padmanabharoy@gmail.com');
  const [actionStatus, setActionStatus] = useState(null);

  // Search history for email
  const [emailHistory] = useState([
    'padmanabharoy@gmail.com',
    'john.t.muller@questdiagnostics.com',
    'mario.beaudoin@uqtr.ca',
    'dennis.jones@us.dlapiper.com',
    'support.endnote@clarivate.com'
  ]);
  const [showHistory, setShowHistory] = useState(false);

  const actions = [
    {
      id: 'clear-font',
      label: 'Clear Font Formatting',
      desc: "This will remove all font settings in all of the User's references."
    },
    {
      id: 'repair-timestamps',
      label: 'Repair Timestamps',
      desc: 'This will repair the Added to Library and Last Updated timestamps for records that have missing timestamps.'
    },
    {
      id: 'set-recovery-sync',
      label: 'Set Recovery Sync',
      desc: 'This will set the Recovery Sync Date to now in GMT.'
    },
    {
      id: 'set-full-sync',
      label: 'Set Full Sync',
      desc: 'This will set the Full Sync Date to now in GMT.'
    },
    {
      id: 'repair-reftypes',
      label: 'Repair RefTypes',
      desc: 'This will set references with no reference type to Generic.'
    },
    {
      id: 'repair-summary',
      label: 'Repair Summary Data',
      desc: "This will remove invisible characters from user's summary data which causes the EndNote summary page to continuously refresh."
    },
    {
      id: 'repair-folder-ids',
      label: 'Repair Reference Folder IDs',
      desc: "This will remove unsupported folder_id's from user's citation data which causes the EndNote sync to fail when retrieving references and EN Online to report invalid reference counts."
    }
  ];

  const handleExecuteAction = (action) => {
    const email = customerEmail.trim();
    if (!email) {
      if (onShowToast) onShowToast("Please specify customer's email address");
      return;
    }

    const timestamp = new Date().toUTCString();
    setActionStatus({
      action: action.label,
      email: email,
      timestamp: timestamp,
      message: `Successfully executed '${action.label}' for ${email} at ${timestamp}.`
    });

    if (onShowToast) onShowToast(`Executed ${action.label} for ${email}`);
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
      {/* Title matching Screenshot 2 */}
      <h1
        style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          color: textColor,
          margin: '0 0 24px 0',
          letterSpacing: '-0.2px'
        }}
      >
        Alter Reference Data
      </h1>

      {/* Email input row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}
      >
        <label
          htmlFor="alter-ref-email"
          style={{
            fontSize: '0.9rem',
            color: textColor,
            fontWeight: 500,
            whiteSpace: 'nowrap'
          }}
        >
          Customer's email address:
        </label>

        <div style={{ position: 'relative' }}>
          <input
            id="alter-ref-email"
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
      </div>

      {/* Actions Table matching Screenshot 2 */}
      <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '960px' }}>
        <tbody>
          {actions.map((act) => (
            <tr key={act.id}>
              <td style={{ padding: '4px 14px 4px 0', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                <button
                  type="button"
                  onClick={() => handleExecuteAction(act)}
                  style={{
                    height: '26px',
                    padding: '0 10px',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '2px',
                    backgroundColor: isDark ? '#1C1C1C' : '#EAEAE5',
                    color: textColor,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    width: '200px',
                    textAlign: 'center'
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
                  {act.label}
                </button>
              </td>
              <td
                style={{
                  padding: '4px 0',
                  fontSize: '0.85rem',
                  color: textColor,
                  verticalAlign: 'middle',
                  lineHeight: 1.4
                }}
              >
                {act.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Execution feedback */}
      {actionStatus && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px 14px',
            border: '1px solid #5E33BF',
            borderRadius: '2px',
            backgroundColor: isDark ? '#141414' : '#FFFFFF',
            fontSize: '0.85rem',
            color: textColor,
            maxWidth: '720px'
          }}
        >
          <span style={{ fontWeight: 700, color: '#5E33BF' }}>Status: </span>
          {actionStatus.message}
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
          lookup.pl version 2.3.0. Page generated in 0.0022 seconds
        </div>
      </div>
    </div>
  );
}
