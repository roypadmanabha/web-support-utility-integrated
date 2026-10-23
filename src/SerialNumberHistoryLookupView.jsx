import React, { useState } from 'react';
import { CUSTOMER_DATABASE, SERIAL_NUMBERS_DATABASE } from './mockData';

// Strict Clarivate brand colors:
// #5E33BF (Clarivate Purple), #F0F0EB (Off-white), #000000 (Black)

export default function SerialNumberHistoryLookupView({ theme = 'light', onSelectSerial, onShowToast }) {
  const isDark =
    theme === 'dark' ||
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark');

  const [serialInput, setSerialInput] = useState('');
  const [emailInput, setEmailInput] = useState('padmanabharoy@gmail.com');
  const [uidInput, setUidInput] = useState('');
  const [activeInput, setActiveInput] = useState(null);

  const [searchResults, setSearchResults] = useState(null);

  // Search histories
  const [serialHistory] = useState(['3201830365', '3091862246', '3091950389', '3102035633', '3101931656']);
  const [emailHistory] = useState([
    'padmanabharoy@gmail.com',
    'john.t.muller@questdiagnostics.com',
    'mario.beaudoin@uqtr.ca',
    'dennis.jones@us.dlapiper.com',
    'support.endnote@clarivate.com'
  ]);
  const [uidHistory] = useState(['al4jWwrsCssAHYeMTG8', 'UID-8829104', 'UID-9912044']);

  const handleSearchBySerial = (e) => {
    if (e) e.preventDefault();
    const sn = serialInput.trim();
    if (!sn) {
      if (onShowToast) onShowToast('Please enter a Serial Number to search');
      return;
    }

    const matches = CUSTOMER_DATABASE.filter(
      (c) => c.serialNumber && c.serialNumber.toLowerCase().includes(sn.toLowerCase())
    );

    if (matches.length > 0) {
      setSearchResults(matches);
    } else {
      // Fallback realistic entry for demonstration
      setSearchResults([
        {
          serialNumber: sn,
          productKey: 'PK-' + sn.substring(0, 6),
          productSummary: 'EndNote 21 Multi-User / Site License',
          customerName: 'Customer Associated with ' + sn,
          email: emailInput || 'customer@organization.com',
          regDeadline: '2028-12-31',
          latestExpDate: '2029-01-01',
          status: 'Active'
        }
      ]);
    }
    if (onShowToast) onShowToast(`Searched Serial Number: ${sn}`);
  };

  const handleSearchByEmail = (e) => {
    if (e) e.preventDefault();
    const email = emailInput.trim();
    if (!email) {
      if (onShowToast) onShowToast('Please enter an Email to search');
      return;
    }

    const matches = CUSTOMER_DATABASE.filter(
      (c) => c.email && c.email.toLowerCase().includes(email.toLowerCase())
    );

    if (matches.length > 0) {
      setSearchResults(matches);
    } else {
      setSearchResults([
        {
          serialNumber: '3201830365',
          productKey: 'PK-320183',
          productSummary: 'EndNote 21 Multi-User License',
          customerName: 'Padmanabha Roy',
          email: email,
          regDeadline: '2028-12-31',
          latestExpDate: '2029-01-01',
          status: 'Active'
        },
        {
          serialNumber: '3091862246',
          productKey: 'PK-309186',
          productSummary: 'EndNote 20 Single User',
          customerName: 'Padmanabha Roy',
          email: email,
          regDeadline: '2026-10-31',
          latestExpDate: '2027-01-01',
          status: 'Active'
        }
      ]);
    }
    if (onShowToast) onShowToast(`Searched history for: ${email}`);
  };

  const handleSearchByUid = (e) => {
    if (e) e.preventDefault();
    const uid = uidInput.trim();
    if (!uid) {
      if (onShowToast) onShowToast('Please enter a UID to search');
      return;
    }

    const matches = CUSTOMER_DATABASE.filter(
      (c) => c.uid && c.uid.toLowerCase().includes(uid.toLowerCase())
    );

    if (matches.length > 0) {
      setSearchResults(matches);
    } else {
      setSearchResults([
        {
          serialNumber: '3091950389',
          productKey: 'PK-309195',
          productSummary: 'EndNote X9 Multi-User',
          customerName: 'Linked UID Customer',
          email: emailInput || 'user@clarivate.com',
          regDeadline: '2027-05-31',
          latestExpDate: '2027-12-31',
          status: 'Active'
        }
      ]);
    }
    if (onShowToast) onShowToast(`Searched UID: ${uid}`);
  };

  const textColor = isDark ? '#FFFFFF' : '#000000';
  const inputBg = isDark ? '#000000' : '#FFFFFF';
  const borderColor = isDark ? '#5E33BF' : '#000000';

  return (
    <div
      style={{
        width: '100%',
        fontFamily: "'Clarivate', 'Clarivate Regular', Futura, 'Memphis', 'Karnak', sans-serif",
        color: textColor,
        backgroundColor: isDark ? '#000000' : '#F0F0EB'
      }}
    >
      {/* Top right Clarivate logo */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '16px',
          paddingRight: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src="/clarivate-mark.svg"
            alt="Clarivate"
            style={{ width: '28px', height: '28px' }}
          />
          <div style={{ lineHeight: 1.05 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: '1.05rem',
                color: textColor,
                letterSpacing: '-0.3px'
              }}
            >
              Clarivate
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: '0.88rem',
                color: textColor
              }}
            >
              Analytics
            </div>
          </div>
        </div>
      </div>

      {/* Title matching Screenshot 3 */}
      <h1
        style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          color: textColor,
          margin: '0 0 24px 0',
          letterSpacing: '-0.2px'
        }}
      >
        Serial Number History Lookup
      </h1>

      {/* 3 Form Rows matching Screenshot 3 */}
      <div style={{ marginBottom: '28px' }}>
        <table style={{ borderCollapse: 'collapse', marginBottom: '8px' }}>
          <tbody>
            {/* Serial Number Row */}
            <tr>
              <td
                style={{
                  padding: '6px 14px 6px 0',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  color: textColor,
                  width: '110px'
                }}
              >
                Serial number:
              </td>
              <td style={{ padding: '6px 10px 6px 0', position: 'relative' }}>
                <input
                  type="text"
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value)}
                  onFocus={() => setActiveInput('serial')}
                  onBlur={() => setTimeout(() => setActiveInput(null), 200)}
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

                {/* History popup */}
                {activeInput === 'serial' && serialHistory.length > 0 && (
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
                      Recent Serial Number Searches
                    </div>
                    {serialHistory.map((item, idx) => (
                      <div
                        key={idx}
                        onMouseDown={() => {
                          setSerialInput(item);
                          setActiveInput(null);
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
              <td style={{ padding: '6px 0' }}>
                <button
                  type="button"
                  onClick={handleSearchBySerial}
                  style={{
                    height: '28px',
                    padding: '0 12px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '2px',
                    backgroundColor: isDark ? '#1C1C1C' : '#EAEAE5',
                    color: textColor,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
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
                  Search By Serial Number
                </button>
              </td>
            </tr>

            {/* Email Row */}
            <tr>
              <td
                style={{
                  padding: '6px 14px 6px 0',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  color: textColor
                }}
              >
                Email:
              </td>
              <td style={{ padding: '6px 10px 6px 0', position: 'relative' }}>
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onFocus={() => setActiveInput('email')}
                  onBlur={() => setTimeout(() => setActiveInput(null), 200)}
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

                {/* Email history popup */}
                {activeInput === 'email' && emailHistory.length > 0 && (
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
                          setEmailInput(item);
                          setActiveInput(null);
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
              <td style={{ padding: '6px 0' }}>
                <button
                  type="button"
                  onClick={handleSearchByEmail}
                  style={{
                    height: '28px',
                    padding: '0 12px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '2px',
                    backgroundColor: isDark ? '#1C1C1C' : '#EAEAE5',
                    color: textColor,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
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
                  Search By Email
                </button>
              </td>
            </tr>

            {/* UID Row */}
            <tr>
              <td
                style={{
                  padding: '6px 14px 6px 0',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  color: textColor
                }}
              >
                UID:
              </td>
              <td style={{ padding: '6px 10px 6px 0', position: 'relative' }}>
                <input
                  type="text"
                  value={uidInput}
                  onChange={(e) => setUidInput(e.target.value)}
                  onFocus={() => setActiveInput('uid')}
                  onBlur={() => setTimeout(() => setActiveInput(null), 200)}
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

                {/* UID history popup */}
                {activeInput === 'uid' && uidHistory.length > 0 && (
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
                      Recent UID Searches
                    </div>
                    {uidHistory.map((item, idx) => (
                      <div
                        key={idx}
                        onMouseDown={() => {
                          setUidInput(item);
                          setActiveInput(null);
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
              <td style={{ padding: '6px 0' }}>
                <button
                  type="button"
                  onClick={handleSearchByUid}
                  style={{
                    height: '28px',
                    padding: '0 12px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '2px',
                    backgroundColor: isDark ? '#1C1C1C' : '#EAEAE5',
                    color: textColor,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
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
                  Search By UID
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Results Table if search executed */}
      {searchResults && searchResults.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px', color: textColor }}>
            Found {searchResults.length} Serial Number Record{searchResults.length > 1 ? 's' : ''}:
          </div>
          <div style={{ overflowX: 'auto', border: `1px solid ${isDark ? '#333333' : '#E2E2D8'}` }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
                backgroundColor: isDark ? '#000000' : '#FFFFFF'
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: isDark ? '#1F1F1F' : '#F0F0EB',
                    borderBottom: `2px solid ${isDark ? '#565656' : '#000000'}`,
                    textAlign: 'left'
                  }}
                >
                  <th style={{ padding: '8px 10px' }}>Serial Number</th>
                  <th style={{ padding: '8px 10px' }}>Product Key</th>
                  <th style={{ padding: '8px 10px' }}>Product Summary</th>
                  <th style={{ padding: '8px 10px' }}>Customer</th>
                  <th style={{ padding: '8px 10px' }}>Email</th>
                  <th style={{ padding: '8px 10px' }}>Reg Deadline</th>
                  <th style={{ padding: '8px 10px' }}>Latest Exp Date</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((item, idx) => {
                  const isEven = idx % 2 === 0;
                  const rowBg = isDark
                    ? isEven ? '#000000' : '#565656'
                    : isEven ? '#FFFFFF' : 'lightgrey';
                  return (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: rowBg,
                        borderBottom: isDark ? '1px solid #333333' : '1px solid rgba(0,0,0,0.06)'
                      }}
                    >
                      <td style={{ padding: '8px 10px' }}>
                        <span
                          onClick={() => onSelectSerial && onSelectSerial(item.serialNumber)}
                          style={{
                            color: isDark ? '#D1C4E9' : '#5E33BF',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                          title={`View expiration dates for ${item.serialNumber}`}
                        >
                          {item.serialNumber}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px' }}>{item.productKey || 'N/A'}</td>
                      <td style={{ padding: '8px 10px' }}>{item.productSummary || 'EndNote License'}</td>
                      <td style={{ padding: '8px 10px' }}>{item.customerName || 'N/A'}</td>
                      <td style={{ padding: '8px 10px' }}>{item.email || 'N/A'}</td>
                      <td style={{ padding: '8px 10px' }}>{item.regDeadline || '2028-12-31'}</td>
                      <td style={{ padding: '8px 10px' }}>{item.latestExpDate || '2029-01-01'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
          lookup.pl version 2.3.0. Page generated in 0.0018 seconds
        </div>
      </div>
    </div>
  );
}
