import React, { useState, useEffect, useRef, useMemo } from 'react';

// Strict Clarivate brand colors only:
// #5E33BF (Clarivate Purple), #F0F0EB (Off-white), #000000 (Black)

export default function SiteLicensesView({ theme = 'light', onSelectSerial, onShowToast }) {
  const isDark = theme === 'dark' || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark');
  const [subView, setSubView] = useState('installer'); // 'installer' or 'admins'
  const [serialInput, setSerialInput] = useState('');
  const [searchHistory, setSearchHistory] = useState([
    '3201830365',
    '3091862246',
    '3091950389',
    '3202030826',
    '3102037021'
  ]);
  const [showHistory, setShowHistory] = useState(false);
  const [installerStatus, setInstallerStatus] = useState(null);

  // Full site admins data (18,429 records)
  const [siteAdmins, setSiteAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Virtual scrolling state
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(650);
  const ROW_HEIGHT = 34;

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key, label) => {
    if (!text || text === 'null') return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
    if (onShowToast) onShowToast(`Copied ${label}: ${text}`);
  };

  // Fetch full dataset on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/siteAdminsData.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load site admins');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setSiteAdmins(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading site admins:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update container height dynamically on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight || 650);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [subView]);

  // Filtered and sorted records
  const filteredData = useMemo(() => {
    let result = siteAdmins;
    if (filterText.trim()) {
      const q = filterText.toLowerCase().trim();
      result = result.filter(
        (item) =>
          (item.customer && item.customer.toLowerCase().includes(q)) ||
          (item.admin && item.admin.toLowerCase().includes(q)) ||
          (item.email && item.email.toLowerCase().includes(q)) ||
          (item.serialNumber && item.serialNumber.toLowerCase().includes(q))
      );
    }

    if (sortField) {
      result = [...result].sort((a, b) => {
        const valA = (a[sortField] || '').toLowerCase();
        const valB = (b[sortField] || '').toLowerCase();
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [siteAdmins, filterText, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleRequestInstallers = (e) => {
    if (e) e.preventDefault();
    const sn = serialInput.trim();
    if (!sn) {
      setInstallerStatus({
        type: 'error',
        message: 'Please enter a valid Serial Number or Product Key.'
      });
      return;
    }

    // Add to search history (keep last 5)
    setSearchHistory((prev) => {
      const updated = [sn, ...prev.filter((item) => item !== sn)].slice(0, 5);
      return updated;
    });

    // Check if SN is in site admins database
    const matched = siteAdmins.find((item) => item.serialNumber === sn);
    if (matched) {
      setInstallerStatus({
        type: 'success',
        message: `Installer verified for ${matched.customer}. Admin: ${matched.admin} (${matched.email}). Windows and Mac multi-user packages ready.`,
        item: matched
      });
      if (onShowToast) onShowToast(`Installers available for SN ${sn}`);
    } else {
      setInstallerStatus({
        type: 'success',
        message: `Installers requested for Serial Number ${sn}. Package generation link has been sent to the registered site licensee.`,
        item: null
      });
      if (onShowToast) onShowToast(`Installers requested for SN ${sn}`);
    }
  };

  // Virtual window slice calculation
  const totalCount = filteredData.length;
  const totalHeight = totalCount * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 15);
  const endIndex = Math.min(
    totalCount,
    startIndex + Math.ceil(containerHeight / ROW_HEIGHT) + 30
  );
  const visibleItems = filteredData.slice(startIndex, endIndex);

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: isDark ? '#000000' : '#F0F0EB',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: isDark ? '#FFFFFF' : '#000000'
      }}
    >
      {/* Top Clarivate Analytics Logo Header - exact as screenshots */}
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
                color: '#000000',
                letterSpacing: '-0.3px'
              }}
            >
              Clarivate
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: '0.88rem',
                color: '#000000'
              }}
            >
              Analytics
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* VIEW 1: GENERATE ENDNOTE MULTI-USER/SITE LICENSE INSTALLERS   */}
      {/* (Exact match to Screenshot 1)                               */}
      {/* ============================================================ */}
      {subView === 'installer' && (
        <div style={{ padding: '0 8px' }}>
          <h2
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 10px 0'
            }}
          >
            Generate EndNote Multi-user/Site License Installers:
          </h2>

          <p
            style={{
              fontSize: '0.9rem',
              color: '#000000',
              margin: '0 0 14px 0',
              fontWeight: 400
            }}
          >
            Please enter the serial number/product key for EndNote X8 or later.
          </p>

          <form
            onSubmit={handleRequestInstallers}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              position: 'relative',
              marginBottom: '18px',
              flexWrap: 'wrap'
            }}
          >
            <label
              htmlFor="site-license-sn-input"
              style={{
                fontSize: '0.9rem',
                color: '#000000',
                fontWeight: 400
              }}
            >
              Serial Number
            </label>

            <div style={{ position: 'relative' }}>
              <input
                id="site-license-sn-input"
                type="text"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                onFocus={() => setShowHistory(true)}
                onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                style={{
                  width: '220px',
                  height: '26px',
                  padding: '2px 8px',
                  fontSize: '0.9rem',
                  border: '1px solid #000000',
                  borderRadius: '2px',
                  backgroundColor: '#FFFFFF',
                  color: '#000000',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                autoComplete="off"
              />

              {/* Last 5 searches autocomplete popup */}
              {showHistory && searchHistory.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '28px',
                    left: 0,
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #5E33BF',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
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
                      borderBottom: '1px solid #F0F0EB',
                      backgroundColor: '#F0F0EB'
                    }}
                  >
                    Recent Searches
                  </div>
                  {searchHistory.map((item, idx) => (
                    <div
                      key={idx}
                      onMouseDown={() => {
                        setSerialInput(item);
                        setShowHistory(false);
                      }}
                      style={{
                        padding: '5px 8px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        color: '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F0F0EB';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
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
                padding: '0 10px',
                fontSize: '0.88rem',
                border: '1px solid #000000',
                borderRadius: '2px',
                backgroundColor: '#F0F0EB',
                color: '#000000',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5E33BF';
                e.currentTarget.style.color = '#F0F0EB';
                e.currentTarget.style.borderColor = '#5E33BF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F0EB';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.borderColor = '#000000';
              }}
            >
              Request/Check Installers
            </button>
          </form>

          {/* Installer status feedback */}
          {installerStatus && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                border: '1px solid #5E33BF',
                backgroundColor: '#F0F0EB',
                fontSize: '0.88rem',
                color: '#000000'
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '4px', color: '#5E33BF' }}>
                Status:
              </div>
              <div>{installerStatus.message}</div>
              {installerStatus.item && (
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => onSelectSerial(installerStatus.item.serialNumber)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#5E33BF',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}
                  >
                    View Expiration Dates & License Key Summary for {installerStatus.item.serialNumber} →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* List Site Admins link - exact as screenshot 1 */}
          <div style={{ marginTop: '14px' }}>
            <button
              type="button"
              id="list-site-admins-link"
              onClick={() => setSubView('admins')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#5E33BF',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.92rem',
                fontWeight: 500,
                fontFamily: 'inherit'
              }}
            >
              List Site Admins
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 2: SITE LICENSE ADMINS/HOLDERS FULL LIST                 */}
      {/* (Exact match to Screenshot 2 with full scroll 18,429 rows)    */}
      {/* ============================================================ */}
      {subView === 'admins' && (
        <div style={{ padding: '0 8px' }}>
          {/* Header Row with title and switch back */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '14px',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <h2
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: isDark ? '#FFFFFF' : '#000000',
                margin: 0
              }}
            >
              Site License Admins/Holders
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Search filter input */}
              <input
                type="text"
                value={filterText}
                onChange={(e) => {
                  setFilterText(e.target.value);
                  setScrollTop(0);
                  if (containerRef.current) containerRef.current.scrollTop = 0;
                }}
                placeholder="Search customers, admins, emails, or SNs..."
                style={{
                  padding: '4px 8px',
                  fontSize: '0.82rem',
                  border: '1px solid #5E33BF',
                  borderRadius: '2px',
                  backgroundColor: isDark ? '#000000' : '#FFFFFF',
                  color: isDark ? '#FFFFFF' : '#000000',
                  width: '280px',
                  fontFamily: 'inherit'
                }}
              />

              <button
                type="button"
                onClick={() => setSubView('installer')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#5E33BF',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  fontFamily: 'inherit'
                }}
              >
                ← Back to Installer Generation
              </button>
            </div>
          </div>

          {/* Records Counter and Sort Note */}
          <div
            style={{
              fontSize: '0.78rem',
              color: '#000000',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>
              Showing <strong>{filteredData.length.toLocaleString()}</strong> entries
              {isLoading && ' (Loading full records...)'}
            </span>
            <span style={{ fontSize: '0.74rem', color: '#5E33BF' }}>
              Full scroll enabled • Click any column header to sort
            </span>
          </div>

          {/* Table Header Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'minmax(230px, 2.5fr) minmax(220px, 2.3fr) minmax(330px, 3.4fr) minmax(130px, 1.2fr)',
              padding: '6px 10px',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: isDark ? '#FFFFFF' : '#000000',
              backgroundColor: isDark ? '#000000' : '#FFFFFF',
              borderBottom: isDark ? '2px solid #565656' : '2px solid #000000',
              userSelect: 'none'
            }}
          >
            <div
              onClick={() => handleSort('customer')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Customer {sortField === 'customer' ? (sortAsc ? '▲' : '▼') : ''}
            </div>
            <div
              onClick={() => handleSort('admin')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Admin/Licensee {sortField === 'admin' ? (sortAsc ? '▲' : '▼') : ''}
            </div>
            <div
              onClick={() => handleSort('email')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Email {sortField === 'email' ? (sortAsc ? '▲' : '▼') : ''}
            </div>
            <div
              onClick={() => handleSort('serialNumber')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Serial Number {sortField === 'serialNumber' ? (sortAsc ? '▲' : '▼') : ''}
            </div>
          </div>

          {/* Virtualized Scrollable Table Body */}
          <div
            ref={containerRef}
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
            style={{
              height: 'calc(100vh - 240px)',
              minHeight: '480px',
              overflowY: 'auto',
              overflowX: 'auto',
              position: 'relative',
              borderBottom: '1px solid #5E33BF',
              backgroundColor: isDark ? '#000000' : '#FFFFFF'
            }}
          >
            {/* Total height spacer for the native scrollbar */}
            {filteredData.length === 0 && !isLoading && (
              <div
                style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  fontSize: '0.95rem',
                  color: isDark ? '#A0A0A0' : '#666666',
                  fontStyle: 'italic'
                }}
              >
                No site admin records loaded. Please provide the new list to populate.
              </div>
            )}
            <div style={{ height: `${totalHeight}px`, position: 'relative', width: '100%' }}>
              {visibleItems.map((item, idx) => {
                const globalIndex = startIndex + idx;
                const isEven = globalIndex % 2 === 0;

                // User Requirement 2:
                // Light mode: one row white, next row lightgrey
                // Dark mode: one row black, next row #565656
                const rowBg = isDark
                  ? (isEven ? '#000000' : '#565656')
                  : (isEven ? '#FFFFFF' : 'lightgrey');

                const rowTextColor = isDark ? '#FFFFFF' : '#000000';

                return (
                  <div
                    key={globalIndex}
                    style={{
                      position: 'absolute',
                      top: `${globalIndex * ROW_HEIGHT}px`,
                      left: 0,
                      right: 0,
                      height: `${ROW_HEIGHT}px`,
                      display: 'grid',
                      gridTemplateColumns:
                        'minmax(230px, 2.5fr) minmax(220px, 2.3fr) minmax(330px, 3.4fr) minmax(130px, 1.2fr)',
                      alignItems: 'center',
                      padding: '0 10px',
                      fontSize: '0.84rem',
                      color: rowTextColor,
                      backgroundColor: rowBg,
                      borderBottom: isDark ? '1px solid #333333' : '1px solid rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    <div
                      title={item.customer}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        paddingRight: '10px'
                      }}
                    >
                      {item.customer || 'null'}
                    </div>

                    {/* Admin / Licensee with adjacent Purple Copy button */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        paddingRight: '12px',
                        overflow: 'hidden'
                      }}
                    >
                      <span
                        title={item.admin}
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.admin || 'null'}
                      </span>
                      {item.admin && item.admin !== 'null' && (
                        <button
                          type="button"
                          className="wsu-copy-btn"
                          onClick={() => handleCopy(item.admin, `${globalIndex}-admin`, 'Admin Name')}
                          title={`Copy ${item.admin}`}
                          style={{
                            backgroundColor: '#5E33BF',
                            color: '#FFFFFF'
                          }}
                        >
                          {copiedKey === `${globalIndex}-admin` ? 'Copied!' : 'Copy'}
                        </button>
                      )}
                    </div>

                    {/* Email with adjacent Purple Copy & Copy Both buttons */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        paddingRight: '12px',
                        overflow: 'hidden'
                      }}
                    >
                      <span
                        title={item.email}
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.email || 'null'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        {item.email && item.email !== 'null' && (
                          <button
                            type="button"
                            className="wsu-copy-btn"
                            onClick={() => handleCopy(item.email, `${globalIndex}-email`, 'Email')}
                            title={`Copy ${item.email}`}
                            style={{
                              backgroundColor: '#5E33BF',
                              color: '#FFFFFF'
                            }}
                          >
                            {copiedKey === `${globalIndex}-email` ? 'Copied!' : 'Copy'}
                          </button>
                        )}
                        {item.admin && item.email && item.admin !== 'null' && item.email !== 'null' && (
                          <button
                            type="button"
                            className="wsu-copy-btn"
                            onClick={() => {
                              const textToCopy = `${item.admin} <${item.email}>`;
                              handleCopy(textToCopy, `${globalIndex}-both`, 'Name & Email');
                            }}
                            title={`Copy Both: ${item.admin} <${item.email}>`}
                            style={{
                              backgroundColor: '#5E33BF',
                              color: '#FFFFFF',
                              padding: '0 6px',
                              fontSize: '0.66rem'
                            }}
                          >
                            {copiedKey === `${globalIndex}-both` ? 'Copied!' : 'Copy Both'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <span
                        onClick={() => onSelectSerial(item.serialNumber)}
                        title={`Click to view expiration dates for ${item.serialNumber}`}
                        style={{
                          color: isDark ? '#D1C4E9' : '#5E33BF',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {item.serialNumber || 'null'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
