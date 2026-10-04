import React, { useState, useEffect } from 'react';
import { CUSTOMER_DATABASE, AUTH_TOKENS_LIST, SERIAL_NUMBERS_DATABASE } from './mockData';

// Space validation helper for email inputs
const checkSpaceInEmail = (emailStr) => {
  if (!emailStr || typeof emailStr !== 'string') return null;

  const hasLeading = /^\s+/.test(emailStr);
  const hasTrailing = /\s+$/.test(emailStr);
  const hasMiddle = /\S\s+\S/.test(emailStr);

  if (hasLeading || hasTrailing || hasMiddle) {
    let positions = [];
    if (hasLeading) positions.push("at the beginning (start)");
    if (hasMiddle) positions.push("in the middle");
    if (hasTrailing) positions.push("at the end (last)");

    let posText = "";
    if (positions.length === 1) {
      posText = positions[0];
    } else if (positions.length === 2) {
      posText = `${positions[0]} or ${positions[1]}`;
    } else {
      posText = `${positions[0]}, ${positions[1]}, or ${positions[2]}`;
    }

    return `Extra space detected ${posText}. Please remove extra space and retype.`;
  }

  return null;
};

// Top-level Smart Input Component: Defined outside App to preserve DOM node identity and input focus on keypress!
const SmartInputField = ({
  label,
  value,
  onChange,
  type = "text",
  requiredNote = false,
  fieldLabel = "",
  style = {},
  errorMessage = null,
  onCopy,
  onPaste
}) => {
  const valStr = value !== undefined && value !== null ? String(value) : '';
  const hasValue = valStr.trim().length > 0;

  const handleButtonClick = () => {
    if (hasValue) {
      if (onCopy) {
        onCopy(valStr, fieldLabel || label || 'field content');
      } else {
        navigator.clipboard.writeText(valStr);
      }
    } else {
      if (onPaste) {
        onPaste(onChange, fieldLabel || label || 'field');
      } else {
        navigator.clipboard.readText().then(text => {
          if (text) onChange(text);
        }).catch(() => {});
      }
    }
  };

  return (
    <div className="wsu-input-group" style={style}>
      {label && <label className="wsu-label">{label}</label>}
      <div
        className="wsu-input-wrapper"
        style={errorMessage ? { borderColor: '#CC0000', boxShadow: '0 0 0 1px #CC0000' } : {}}
      >
        <input
          type={type}
          className="wsu-input"
          value={valStr}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck="false"
        />
        <button
          type="button"
          className="wsu-action-btn"
          onClick={handleButtonClick}
        >
          {hasValue ? 'Copy' : 'Paste'}
        </button>
      </div>
      {errorMessage ? (
        <div style={{ fontSize: '0.72rem', color: '#CC0000', fontWeight: 400, marginTop: '4px' }}>
          ⚠️ {errorMessage}
        </div>
      ) : (
        requiredNote && (
          <span className="wsu-note-text" style={{ fontSize: '0.69rem', fontStyle: 'italic' }}>
            * Email is exact matching only
          </span>
        )
      )}
    </div>
  );
};

// Top-level Header Bar Component
const HeaderBar = ({ titleText, backActionText, onBackClick, onShowToast, theme, onToggleTheme }) => (
  <header className="wsu-header">
    <div className="wsu-header-left">
      <div className="wsu-header-logo-container">
        <img src="/clarivate-logo.svg" alt="Clarivate Logo" className="wsu-header-logo" />
      </div>
      <div className="wsu-header-title">
        <span>{titleText || 'Web Support Utility (WSU)'}</span>
      </div>
    </div>

    <div className="wsu-header-right">
      {backActionText && onBackClick && (
        <button className="wsu-btn-primary" onClick={onBackClick}>
          {backActionText}
        </button>
      )}
      <div className="wsu-header-user">
        Logged in: <span>padmanabha.roy@clarivate.com</span>
      </div>
      <button className="wsu-header-link" onClick={() => onShowToast && onShowToast('Password change form opened')}>
        Change Password
      </button>
      <span>|</span>
      <button className="wsu-header-link" onClick={() => onShowToast && onShowToast('User logged out')}>
        Logout
      </button>
      <span>|</span>
      <button
        type="button"
        className="wsu-theme-toggle"
        onClick={onToggleTheme}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle dark/light mode"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  </header>
);

export default function App() {
  // Theme State ('light' | 'dark')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('clarivate_wsu_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('clarivate_wsu_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
  };

  // Page View state: 'wsu-home' | 'registration-database' | 'serial-detail'
  const [currentPage, setCurrentPage] = useState('wsu-home');
  const [activeNav, setActiveNav] = useState('Search Customers');
  const [activeRegSubNav, setActiveRegSubNav] = useState('Registration Database');
  const [toastMessage, setToastMessage] = useState(null);

  // Search Customers Form State
  const [searchEmail, setSearchEmail] = useState('');
  const [searchSteamId, setSearchSteamId] = useState('');
  const [searchUid, setSearchUid] = useState('');
  const [searchResearcherId, setSearchResearcherId] = useState('');
  const [searchInternalId, setSearchInternalId] = useState('');
  const [searchSerialNumber, setSearchSerialNumber] = useState('');
  const [matchType, setMatchType] = useState('exact');

  // Results State
  const [searchResults, setSearchResults] = useState(null);

  // User Access Lookup State
  const [accessSearchEmail, setAccessSearchEmail] = useState('');
  const [accessSearchUid, setAccessSearchUid] = useState('');
  const [showEntriesCount, setShowEntriesCount] = useState(100);
  const [accessFilterQuery, setAccessFilterQuery] = useState('');
  const [hasExecutedAccessSearch, setHasExecutedAccessSearch] = useState(false);

  // Registration Database State
  const [regSearchQuery, setRegSearchQuery] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regOrganization, setRegOrganization] = useState('');
  const [regEmailAddress, setRegEmailAddress] = useState('');
  const [regPhoneNumber, setRegPhoneNumber] = useState('');
  const [regSerialNumber, setRegSerialNumber] = useState('');
  const [hasExecutedRegSearch, setHasExecutedRegSearch] = useState(false);
  const [selectedSerialDetail, setSelectedSerialDetail] = useState(CUSTOMER_DATABASE[0]);

  // Serial Number Lookup Tab State
  const [snLookupInput, setSnLookupInput] = useState('');
  const [snLookupResult, setSnLookupResult] = useState(null);

  // Dummy Serial Number Generator Form State
  const [dummyProduct, setDummyProduct] = useState('EndNote');
  const [dummyVersion, setDummyVersion] = useState('22');
  const [dummyPlatform, setDummyPlatform] = useState('Hybrid');
  const [dummyType, setDummyType] = useState('Full Download');
  const [generatedDummyResult, setGeneratedDummyResult] = useState(null);

  // Generic Nav Input State
  const [genericQuery, setGenericQuery] = useState('');

  // Toast notification trigger
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Clipboard Copy helper
  const handleCopy = (text, label) => {
    if (!text || text === 'null') {
      showToast('Nothing to copy');
      return;
    }
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label || text} to clipboard`);
  };

  // Clipboard Paste helper
  const handlePaste = async (setter, label) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setter(text);
        const spaceErr = checkSpaceInEmail(text);
        if (spaceErr && (label.toLowerCase().includes('email') || text.includes('@'))) {
          showToast(spaceErr);
        } else {
          showToast(`Pasted into ${label}`);
        }

        // If performing SN Lookup and 10 digit number pasted
        const cleanText = text.trim();
        if (cleanText.length >= 8) {
          const found = CUSTOMER_DATABASE.find(c => c.serialNumber === cleanText) || CUSTOMER_DATABASE[0];
          setSnLookupResult(found);
        }
      }
    } catch (err) {
      showToast('Clipboard paste permission required');
    }
  };

  // Helper generator to create realistic mock customer data for any typed input or @clarivate.com email
  const generateRandomCustomer = (emailInput, customFields = {}) => {
    const clean = emailInput ? emailInput.trim() : 'user@clarivate.com';
    const fullEmail = clean.includes('@') ? clean : `${clean}@clarivate.com`;
    const localPart = fullEmail.split('@')[0] || 'user';
    const parts = localPart.split('.');
    const rawFirst = parts[0] || 'User';
    const rawLast = parts[1] || 'Clarivate';
    const first = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1);
    const last = rawLast.charAt(0).toUpperCase() + rawLast.slice(1);

    const rand8 = Math.floor(10000000 + Math.random() * 90000000);
    const randSN = customFields.serialNumber || `3102${Math.floor(100000 + Math.random() * 900000)}`;
    const randKey = `RG647-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-LHDMH`;

    return {
      first,
      last,
      email: fullEmail,
      steamId: customFields.steamId || `${Math.floor(20000000 + Math.random() * 80000000)}`,
      uid: customFields.uid || `al4j${Math.random().toString(36).substring(2, 12)}`,
      researcherId: customFields.researcherId || `${rand8}`,
      internalId: customFields.internalId || `${rand8}`,
      serialNumber: randSN,
      custId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      virtCustId: `VCUST-${Math.floor(100 + Math.random() * 900)}`,
      citeDb: `CiteDB_${Math.floor(100 + Math.random() * 900)}`,
      state: "EN22",
      endnoteVersion: "EndNote 22 (EN22)",
      registrationStatus: "Registered / Active",
      libVer: "5.0.0",
      fileStorage: "5120 MB",
      lastUsn: `${Math.floor(1000 + Math.random() * 9000)}`,
      fullSyncBefore: "2026-08-15 12:00:00.0",
      recovSyncBefore: "2010-01-01 00:00:00.0",
      organization: "Clarivate Analytics",
      expirationDate: "2028-12-31",
      phoneNumber: "+1 800-336-4474",
      regTime: "2026-10-04 12:00:00",
      productKey: randKey,
      productSummary: "This is a Multi User Download of EndNote 22 for Both Mac & Windows.",
      regDeadline: "May 31, 2028",
      latestExpDate: "June 1, 2031",
      webSeats: 5000,
      winDownload: "https://download.endnote.com/downloads/2025/EN2025Inst.exe",
      macDownload: "https://download.endnote.com/downloads/2025/EndNote2025Installer.dmg",
      ...customFields
    };
  };

  // Execute Search Customers logic
  const handleCustomerSearch = (e) => {
    if (e) e.preventDefault();

    // Validate email space errors
    const emailSpaceErr = checkSpaceInEmail(searchEmail);
    if (emailSpaceErr) {
      showToast(emailSpaceErr);
      return;
    }

    // Check if any search input is populated
    const hasAnyInput = [
      searchEmail,
      searchSteamId,
      searchUid,
      searchResearcherId,
      searchInternalId,
      searchSerialNumber
    ].some(val => val.trim().length > 0);

    if (!hasAnyInput) {
      setSearchResults(null);
      showToast('Please enter at least one search field before searching');
      return;
    }

    // 1. Search existing static database entries
    let results = CUSTOMER_DATABASE.filter(cust => {
      const fieldsToMatch = [
        { val: searchEmail, target: cust.email },
        { val: searchSteamId, target: cust.steamId },
        { val: searchUid, target: cust.uid },
        { val: searchResearcherId, target: cust.researcherId },
        { val: searchInternalId, target: cust.internalId },
        { val: searchSerialNumber, target: cust.serialNumber }
      ];

      const activeInputs = fieldsToMatch.filter(f => f.val.trim() !== '');
      return activeInputs.some(f => {
        const query = f.val.trim().toLowerCase();
        const target = f.target.toLowerCase();
        return matchType === 'exact' ? target === query : target.includes(query);
      });
    });

    // 2. If user typed an email, generate a mock customer entry!
    if (searchEmail.trim() !== '') {
      const typed = searchEmail.trim().toLowerCase();
      const alreadyExists = results.some(r => r.email.toLowerCase() === typed);

      if (!alreadyExists) {
        const generated = generateRandomCustomer(typed, {
          steamId: searchSteamId || undefined,
          uid: searchUid || undefined,
          researcherId: searchResearcherId || undefined,
          internalId: searchInternalId || undefined,
          serialNumber: searchSerialNumber || undefined
        });
        results = [generated, ...results];
      }
    }

    // 3. Fallback: if user typed input, generate customer record matching input query
    if (results.length === 0) {
      const activeSearchQuery = searchEmail.trim() || searchSteamId.trim() || searchUid.trim() || searchResearcherId.trim() || searchInternalId.trim() || searchSerialNumber.trim();
      if (activeSearchQuery) {
        results = [generateRandomCustomer(activeSearchQuery)];
      }
    }

    setSearchResults(results);
    showToast(`Found ${results.length} matching customer record(s)`);
  };

  // Reset Search Form
  const handleResetSearch = () => {
    setSearchEmail('');
    setSearchSteamId('');
    setSearchUid('');
    setSearchResearcherId('');
    setSearchInternalId('');
    setSearchSerialNumber('');
    setSearchResults(null);
    showToast('Search criteria cleared');
  };

  // Quick Preset Demo Loader
  const handleLoadDemo = () => {
    setSearchEmail('padmanabha.roy@clarivate.com');
    setSearchSteamId('28228584');
    setSearchUid('al4jWwrsCssAHYeMTG8');
    setSearchResearcherId('10790292');
    setSearchInternalId('10790292');
    setSearchSerialNumber('3102299999');
    setMatchType('exact');
    setSearchResults([CUSTOMER_DATABASE[0]]);
    showToast('Loaded demo parameters for padmanabha.roy@clarivate.com');
  };

  // Open Serial Detail page
  const handleOpenSerialDetail = (cust) => {
    setSelectedSerialDetail(cust);
    setCurrentPage('serial-detail');
    showToast(`Viewing license details for Serial #${cust.serialNumber}`);
  };

  // Handle SN Lookup Form Submission
  const handleSNLookupSubmit = (e) => {
    if (e) e.preventDefault();
    const query = snLookupInput.trim();
    if (!query) {
      showToast('Please enter a 10-digit Serial Number');
      return;
    }
    const found = CUSTOMER_DATABASE.find(c => c.serialNumber === query) || generateRandomCustomer('user@clarivate.com', { serialNumber: query });
    setSnLookupResult(found);
    showToast(`Retrieved details for Serial #${query}`);
  };

  // Handle Dummy Serial Number Generation
  const handleGenerateDummySN = (e) => {
    if (e) e.preventDefault();
    const randomSN = `3102-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-00${dummyVersion}`;
    const randomKey = `DUMMY-${dummyProduct.toUpperCase().slice(0, 2)}${dummyVersion}-${dummyPlatform.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    const result = {
      serialNumber: randomSN,
      productKey: randomKey,
      product: dummyProduct,
      version: dummyVersion,
      platform: dummyPlatform,
      type: dummyType,
      generatedAt: new Date().toLocaleString()
    };

    setGeneratedDummyResult(result);
    showToast(`Generated Dummy Serial Number for ${dummyProduct} ${dummyVersion}`);
  };

  // Filtered Registration Database results with dynamic generator
  const filteredRegDatabase = (() => {
    const qEmail = (regEmailAddress || regSearchQuery || '').toLowerCase().trim();
    const qFirst = regFirstName.toLowerCase().trim();
    const qLast = regLastName.toLowerCase().trim();
    const qOrg = regOrganization.toLowerCase().trim();
    const qPhone = regPhoneNumber.toLowerCase().trim();
    const qSerial = regSerialNumber.toLowerCase().trim();

    const matches = CUSTOMER_DATABASE.filter(c => {
      const matchEmail = !qEmail || c.email.toLowerCase().includes(qEmail);
      const matchFirst = !qFirst || c.first.toLowerCase().includes(qFirst);
      const matchLast = !qLast || c.last.toLowerCase().includes(qLast);
      const matchOrg = !qOrg || c.organization.toLowerCase().includes(qOrg);
      const matchPhone = !qPhone || c.phoneNumber.toLowerCase().includes(qPhone);
      const matchSerial = !qSerial || c.serialNumber.toLowerCase().includes(qSerial);
      return matchEmail && matchFirst && matchLast && matchOrg && matchPhone && matchSerial;
    });

    if (matches.length > 0) return matches;

    if (qEmail.includes('@') || qFirst || qLast || qSerial) {
      const targetEmail = qEmail || 'fabian.marsden@gmail.com';
      return [generateRandomCustomer(targetEmail, {
        first: regFirstName || 'Fabian',
        last: regLastName || 'Marsden',
        organization: regOrganization || 'Clarivate Analytics',
        phoneNumber: regPhoneNumber || '555-0199',
        serialNumber: regSerialNumber || '3102299999'
      })];
    }

    return CUSTOMER_DATABASE;
  })();

  // Filtered Auth Tokens with dynamic generator
  const filteredAuthTokens = (() => {
    const matched = AUTH_TOKENS_LIST.filter(item => {
      const matchesEmail = !accessSearchEmail || item.userEmail.toLowerCase().includes(accessSearchEmail.toLowerCase());
      const matchesUid = !accessSearchUid || item.uid.toLowerCase().includes(accessSearchUid.toLowerCase());
      const matchesQuery = !accessFilterQuery || 
        item.authToken.toLowerCase().includes(accessFilterQuery.toLowerCase()) ||
        item.clientName.toLowerCase().includes(accessFilterQuery.toLowerCase());
      return matchesEmail && matchesUid && matchesQuery;
    });

    if (matched.length > 0) return matched.slice(0, Number(showEntriesCount));

    if (accessSearchEmail && (accessSearchEmail.includes('@clarivate.com') || accessSearchEmail.includes('@'))) {
      const generatedToken = {
        userEmail: accessSearchEmail.trim().toLowerCase(),
        uid: accessSearchUid || `al4j${Math.random().toString(36).substring(2, 10)}`,
        authToken: `auth_live_${Math.random().toString(36).substring(2, 16)}`,
        clientName: "EndNote Desktop 22 / WSU Access",
        createdTime: "2026-10-04 12:00:00",
        expireTime: "2028-12-31 23:59:59"
      };
      return [generatedToken];
    }

    return matched;
  })();



  // =========================================================================
  // PAGE 2: REGISTRATION DATABASE SEPARATE PAGE (SCREENSHOT 2 ENHANCED)
  // =========================================================================
  if (currentPage === 'registration-database') {
    return (
      <div className="wsu-layout">
        {/* Uniform Header Bar */}
        <HeaderBar
          titleText="Registration Database"
          backActionText="Back to Web Support Utility"
          onBackClick={() => setCurrentPage('wsu-home')}
          theme={theme}
          onToggleTheme={toggleTheme}
          onShowToast={showToast}
        />

        {/* Body Container */}
        <div className="wsu-body">
          {/* Sub Navigation Sidebar */}
          <aside className="wsu-sidebar" style={{ width: '250px' }}>
            <div className="wsu-sidebar-section">
              <div className="wsu-sidebar-heading">Registration Services</div>
              {[
                'Serial Number Lookup',
                'Registration Database',
                'Bld Number Lookup',
                'Dummy Serial Number',
                'Product Downloads',
                'Site Licenses'
              ].map((link, idx) => (
                <button
                  key={idx}
                  className={`wsu-sidebar-item ${activeRegSubNav === link ? 'active' : ''}`}
                  onClick={() => {
                    setActiveRegSubNav(link);
                    showToast(`Selected ${link}`);
                  }}
                >
                  <span>{link}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content Card Area */}
          <main className="wsu-content">
            
            {/* SUB VIEW A: SERIAL NUMBER LOOKUP TAB (MATCHING SCREENSHOT 1 & 2) */}
            {activeRegSubNav === 'Serial Number Lookup' && (
              <div className="wsu-card">
                <div className="wsu-card-title">
                  <span>Serial Number Lookup</span>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '0.89rem', color: '#000000', marginBottom: '14px', fontWeight: 400 }}>
                    Registration service view for <span>Serial Number Lookup</span>.
                  </p>

                  <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="wsu-btn-primary"
                      onClick={() => {
                        const target = snLookupInput.trim();
                        if (!target) {
                          setSnLookupResult(null);
                          showToast('Please enter a 10-digit Serial Number before searching');
                          return;
                        }
                        const found = CUSTOMER_DATABASE.find(c => c.serialNumber === target) || {
                          ...CUSTOMER_DATABASE[0],
                          serialNumber: target
                        };
                        setSnLookupResult(found);
                        showToast(`Executing Serial Number Lookup for ${target}`);
                      }}
                    >
                      Execute Serial Number Lookup
                    </button>
                    <button
                      type="button"
                      className="wsu-btn-secondary"
                      onClick={() => {
                        setSnLookupInput('');
                        setSnLookupResult(null);
                        showToast('Cleared input field. Ready for pasting.');
                      }}
                    >
                      Clear / Reset Input
                    </button>
                  </div>

                  {/* Input Field with Paste / Copy button */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSNLookupSubmit(e);
                    }}
                    className="wsu-form-box"
                    style={{ maxWidth: '650px', padding: '16px', borderRadius: '6px' }}
                  >
                    <SmartInputField
                      label="Input 10-Digit Serial Number:"
                      value={snLookupInput}
                      onChange={(val) => {
                        setSnLookupInput(val);
                        const cleanVal = val.trim();
                        if (cleanVal.length >= 8) {
                          const found = CUSTOMER_DATABASE.find(c => c.serialNumber === cleanVal) || generateRandomCustomer('user@clarivate.com', { serialNumber: cleanVal });
                          setSnLookupResult(found);
                        } else if (cleanVal.length === 0) {
                          setSnLookupResult(null);
                        }
                      }}
                      fieldLabel="Serial Number Input"
                    />
                  </form>
                </div>

                {/* Serial Number Lookup Result details matching Screenshot 1 */}
                {snLookupResult && (
                  <div className="wsu-result-box" style={{ padding: '24px', borderRadius: '6px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.89rem', color: '#000000', marginBottom: '6px' }}>
                      <strong>Serial Number:</strong> <span style={{ fontWeight: 400, color: '#000000' }}>{snLookupResult.serialNumber}</span>
                    </div>

                    <div style={{ fontSize: '0.89rem', color: '#000000', marginBottom: '14px' }}>
                      <strong>Product Key:</strong> <span style={{ fontWeight: 400, color: '#000000' }}>{snLookupResult.productKey}</span>
                    </div>

                    <div style={{ fontSize: '0.89rem', color: '#000000', fontWeight: 700, marginBottom: '18px' }}>
                      {snLookupResult.productSummary}
                    </div>

                    {/* NOTES ALERT BOX */}
                    <div className="wsu-alert-notes" style={{ padding: '14px 16px', borderRadius: '4px', marginBottom: '18px' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.89rem', color: '#000000', marginBottom: '4px' }}>NOTES:</div>
                      <div style={{ fontWeight: 800, color: '#CC0000', fontSize: '0.84rem', marginBottom: '2px' }}>
                        DO NOT SEND THIS INFORMATION TO THE CUSTOMER.
                      </div>
                      <div style={{ fontWeight: 800, color: '#CC0000', fontSize: '0.84rem' }}>
                        This is for Multi User Admins only.
                      </div>
                    </div>

                    {/* Mass Deployment Information */}
                    <div style={{ fontSize: '0.84rem', color: '#000000', lineHeight: 1.7, marginBottom: '18px' }}>
                      <p style={{ marginBottom: '8px' }}>
                        This version can be installed the normal way, or by following these steps for mass deployment:{' '}
                        <a href="http://www.endnote.com/multi" target="_blank" rel="noreferrer" style={{ color: '#5E33BF', fontWeight: 800, textDecoration: 'underline' }}>
                          http://www.endnote.com/multi
                        </a>
                      </p>
                      <div>- Registration Deadline: <strong>{snLookupResult.regDeadline}</strong></div>
                      <div>- Latest Expiration Date: <strong>{snLookupResult.latestExpDate}</strong></div>
                      <div>This license allows for <strong>{snLookupResult.webSeats} EndNote Web seats</strong>.</div>
                    </div>

                    {/* Installer Download Links */}
                    <div style={{ borderTop: '1px solid #5E33BF', paddingTop: '16px', fontSize: '0.84rem', lineHeight: 1.8 }}>
                      <p style={{ fontWeight: 700, marginBottom: '8px' }}>This product key will allow for installs of both Windows and Macintosh versions.</p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span>The user can download a copy of the Windows Installer from:</span>
                        <a href={snLookupResult.winDownload} target="_blank" rel="noreferrer" style={{ color: '#5E33BF', fontWeight: 800, textDecoration: 'underline' }}>{snLookupResult.winDownload}</a>
                        <button className="wsu-action-btn" onClick={() => handleCopy(snLookupResult.winDownload, 'Windows Installer Link')} style={{ padding: '2px 8px' }}>Copy</button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>The user can download a copy of the Macintosh Installer from:</span>
                        <a href={snLookupResult.macDownload} target="_blank" rel="noreferrer" style={{ color: '#5E33BF', fontWeight: 800, textDecoration: 'underline' }}>{snLookupResult.macDownload}</a>
                        <button className="wsu-action-btn" onClick={() => handleCopy(snLookupResult.macDownload, 'Macintosh Installer Link')} style={{ padding: '2px 8px' }}>Copy</button>
                      </div>
                    </div>

                    {/* Warning Notice Box */}
                    <div className="wsu-warning-box" style={{ padding: '14px', fontWeight: 800, fontSize: '0.82rem', marginTop: '20px' }}>
                      PLEASE NOTE: The above information is a summarization of information for internal use only. Please do NOT simply copy and paste the entire message in an email to an external customer.
                    </div>
                  </div>
                )}

                {/* System Footer Strip */}
                <div className="wsu-footer-strip" style={{ paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.79rem' }}>
                  <button
                    style={{ background: 'none', border: 'none', color: '#5E33BF', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
                    onClick={() => showToast('Error report dialog opened')}
                  >
                    Report an Error
                  </button>
                  <div style={{ fontStyle: 'italic', fontWeight: 600 }}>
                    lookup.pl version 2.3.0. Page generated in 0.5100 seconds
                  </div>
                </div>
              </div>
            )}

            {/* SUB VIEW B: REGISTRATION DATABASE TABLE & SEARCH FORM */}
            {activeRegSubNav === 'Registration Database' && (
              <div className="wsu-card">
                {/* Search Form Section matching Screenshot */}
                <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #5E33BF' }}>
                  <h3 style={{ fontSize: '1.09rem', color: '#000000', fontWeight: 400, marginBottom: '16px' }}>
                    Search the Registration Database:
                  </h3>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const regEmailErr = checkSpaceInEmail(regEmailAddress);
                      if (regEmailErr) {
                        showToast(regEmailErr);
                        return;
                      }

                      const hasAnyInput = [
                        regFirstName,
                        regLastName,
                        regOrganization,
                        regEmailAddress,
                        regPhoneNumber,
                        regSerialNumber,
                        regSearchQuery
                      ].some(val => val.trim().length > 0);

                      if (!hasAnyInput) {
                        setHasExecutedRegSearch(false);
                        showToast('Please enter at least one search field before searching');
                        return;
                      }

                      setHasExecutedRegSearch(true);
                      showToast(`Search Registration executed for ${regEmailAddress || regFirstName || regLastName || regSerialNumber || 'query'}`);
                    }}
                    style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    <SmartInputField
                      label="First Name"
                      value={regFirstName}
                      onChange={setRegFirstName}
                      fieldLabel="First Name"
                    />
                    <SmartInputField
                      label="Last Name"
                      value={regLastName}
                      onChange={setRegLastName}
                      fieldLabel="Last Name"
                    />
                    <SmartInputField
                      label="Organization"
                      value={regOrganization}
                      onChange={setRegOrganization}
                      fieldLabel="Organization"
                    />
                    <SmartInputField
                      label="Email Address"
                      value={regEmailAddress}
                      onChange={setRegEmailAddress}
                      fieldLabel="Email Address"
                      errorMessage={checkSpaceInEmail(regEmailAddress)}
                    />
                    <SmartInputField
                      label="Phone Number"
                      value={regPhoneNumber}
                      onChange={setRegPhoneNumber}
                      fieldLabel="Phone Number"
                    />
                    <SmartInputField
                      label="Serial Number"
                      value={regSerialNumber}
                      onChange={setRegSerialNumber}
                      fieldLabel="Serial Number"
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
                      <button
                        type="submit"
                        className="wsu-btn-secondary"
                        style={{ padding: '6px 16px', fontSize: '0.85rem', fontWeight: 400 }}
                      >
                        Search Registration
                      </button>
                      <span style={{ fontSize: '0.85rem', color: '#000000', fontStyle: 'italic' }}>
                        Note this may take a few minutes
                      </span>
                    </div>
                  </form>
                </div>

                {/* Results Title & Table (Only displayed after clicking Search Registration) */}
                {hasExecutedRegSearch ? (
                  <>
                    <div className="wsu-card-title">
                      <span>
                        {filteredRegDatabase.length} Search Result for {regEmailAddress || regSearchQuery || 'all records'}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                        <span className="wsu-label">Filter:</span>
                        <div style={{ width: '240px' }}>
                          <SmartInputField
                            value={regSearchQuery}
                            onChange={setRegSearchQuery}
                            fieldLabel="Quick Filter"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="wsu-table-container" style={{ marginBottom: '16px' }}>
                      <table className="wsu-table">
                        <thead>
                          <tr>
                            <th>Last Name</th>
                            <th>First Name</th>
                            <th>Organization</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Serial Number</th>
                            <th>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRegDatabase.map((row, idx) => (
                            <tr key={idx}>
                              <td>
                                {row.last}
                                <button className="wsu-copy-cell-btn" onClick={() => handleCopy(row.last, 'Last Name')}>Copy</button>
                              </td>
                              <td>
                                {row.first}
                                <button className="wsu-copy-cell-btn" onClick={() => handleCopy(row.first, 'First Name')}>Copy</button>
                              </td>
                              <td>{row.organization}</td>
                              <td>
                                <button
                                  style={{ background: 'none', border: 'none', color: '#5E33BF', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
                                  onClick={() => handleCopy(row.email, 'Email')}
                                >
                                  {row.email}
                                </button>
                                <button className="wsu-copy-cell-btn" onClick={() => handleCopy(row.email, 'Email')}>Copy</button>
                              </td>
                              <td>{row.phoneNumber}</td>
                              <td>
                                <button
                                  style={{ background: 'none', border: 'none', color: '#5E33BF', textDecoration: 'underline', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
                                  onClick={() => handleOpenSerialDetail(row)}
                                  title="Click to view Serial Number & License Details"
                                >
                                  {row.serialNumber}
                                </button>
                                <button className="wsu-copy-cell-btn" onClick={() => handleCopy(row.serialNumber, 'Serial Number')}>Copy</button>
                              </td>
                              <td>{row.regTime}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#000000', marginBottom: '24px', fontWeight: 700 }}>
                      Showing 1 to {filteredRegDatabase.length} of {filteredRegDatabase.length} entries
                    </div>

                    <div style={{ borderTop: '1px solid #5E33BF', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#000000' }}>
                      <button
                        style={{ background: 'none', border: 'none', color: '#5E33BF', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
                        onClick={() => showToast('Error report dialog opened')}
                      >
                        Report an Error
                      </button>
                      <div style={{ fontStyle: 'italic', fontWeight: 600 }}>
                        lookup.pl version 2.3.0. Page generated in 3.8782 seconds
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#000000' }}>
                    <button
                      style={{ background: 'none', border: 'none', color: '#5E33BF', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
                      onClick={() => showToast('Error report dialog opened')}
                    >
                      Report an Error
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SUB VIEW C: DUMMY SERIAL NUMBER (MATCHING SCREENSHOT 1) */}
            {activeRegSubNav === 'Dummy Serial Number' && (
              <div className="wsu-card">
                <div className="wsu-card-title">
                  <span>Dummy Serial Number/Product Key:</span>
                </div>

                <div style={{ fontSize: '0.88rem', color: '#000000', lineHeight: 1.6, marginBottom: '20px' }}>
                  <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                    Note: The Dummy Serial Number/Product Key provided for EndNote will always be the Full Download version for this tool.
                  </p>
                  <p style={{ fontWeight: 600 }}>
                    For EndNote X8 and later always select Hybrid, even if the users are calling about Windows or Mac.
                  </p>
                </div>

                {/* Dropdown Control Strip matching Screenshot */}
                <form onSubmit={handleGenerateDummySN} style={{ marginBottom: '24px' }}>
                  <div className="wsu-strip-box" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', padding: '16px', borderRadius: '6px' }}>
                    
                    {/* Product */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label className="wsu-label">Product</label>
                      <select
                        value={dummyProduct}
                        onChange={(e) => setDummyProduct(e.target.value)}
                        className="wsu-select"
                      >
                        <option value="EndNote">EndNote</option>
                        <option value="Reference Manager">Reference Manager</option>
                        <option value="ProCite">ProCite</option>
                      </select>
                    </div>

                    {/* Version */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label className="wsu-label">Version</label>
                      <select
                        value={dummyVersion}
                        onChange={(e) => setDummyVersion(e.target.value)}
                        className="wsu-select"
                      >
                        <option value="22">22</option>
                        <option value="21">21</option>
                        <option value="20">20</option>
                        <option value="X9">X9</option>
                        <option value="X8">X8</option>
                      </select>
                    </div>

                    {/* Platform */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label className="wsu-label">Platform</label>
                      <select
                        value={dummyPlatform}
                        onChange={(e) => setDummyPlatform(e.target.value)}
                        className="wsu-select"
                      >
                        <option value="Hybrid">Hybrid</option>
                        <option value="Windows">Windows</option>
                        <option value="Macintosh">Macintosh</option>
                      </select>
                    </div>

                    {/* Type */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label className="wsu-label">Type</label>
                      <select
                        value={dummyType}
                        onChange={(e) => setDummyType(e.target.value)}
                        className="wsu-select"
                      >
                        <option value="Full Download">Full Download</option>
                        <option value="Upgrade">Upgrade</option>
                        <option value="Volume">Volume</option>
                      </select>
                    </div>

                    {/* Get Dummy SN Button */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', paddingTop: '20px' }}>
                      <button type="submit" className="wsu-btn-primary">
                        Get Dummy SN
                      </button>
                    </div>
                  </div>
                </form>

                {/* Generated Dummy Serial Result Display */}
                {generatedDummyResult && (
                  <div className="wsu-result-box" style={{ padding: '18px', borderRadius: '6px', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#5E33BF', marginBottom: '10px' }}>
                      Generated Dummy License Parameters ({generatedDummyResult.product} {generatedDummyResult.version}):
                    </h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '0.9rem' }}>
                      <span className="wsu-label">Dummy Serial Number:</span>
                      <strong style={{ fontSize: '1.05rem', color: '#5E33BF' }}>{generatedDummyResult.serialNumber}</strong>
                      <button className="wsu-action-btn" onClick={() => handleCopy(generatedDummyResult.serialNumber, 'Dummy Serial Number')}>
                        Copy
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                      <span className="wsu-label">Dummy Product Key:</span>
                      <strong style={{ fontSize: '1.05rem', color: '#5E33BF' }}>{generatedDummyResult.productKey}</strong>
                      <button className="wsu-action-btn" onClick={() => handleCopy(generatedDummyResult.productKey, 'Dummy Product Key')}>
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                {/* System Footer Strip */}
                <div style={{ borderTop: '1px solid #5E33BF', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#000000' }}>
                  <button
                    style={{ background: 'none', border: 'none', color: '#5E33BF', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
                    onClick={() => showToast('Error report dialog opened')}
                  >
                    Report an Error
                  </button>
                  <div style={{ fontStyle: 'italic', fontWeight: 600 }}>
                    lookup.pl version 2.3.0. Page generated in 0.0019 seconds
                  </div>
                </div>
              </div>
            )}

            {/* OTHER SUB VIEWS */}
            {!['Serial Number Lookup', 'Registration Database', 'Dummy Serial Number'].includes(activeRegSubNav) && (
              <div className="wsu-card">
                <div className="wsu-card-title">
                  <span>{activeRegSubNav}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#000000', marginBottom: '16px' }}>
                  Registration service view for <strong>{activeRegSubNav}</strong>.
                </p>
                <button className="wsu-btn-primary" onClick={() => showToast(`Executed ${activeRegSubNav}`)}>
                  Execute {activeRegSubNav}
                </button>
              </div>
            )}

          </main>
        </div>

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="wsu-toast">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // PAGE 3: SERIAL NUMBER & LICENSE DETAIL SEPARATE PAGE (SCREENSHOT 3 ENHANCED)
  // =========================================================================
  if (currentPage === 'serial-detail' && selectedSerialDetail) {
    return (
      <div className="wsu-layout">
        {/* Uniform Header Bar */}
        <HeaderBar
          titleText="Serial Number & License Key Detail"
          backActionText="Back to Registration Database"
          onBackClick={() => setCurrentPage('registration-database')}
          theme={theme}
          onToggleTheme={toggleTheme}
          onShowToast={showToast}
        />

        {/* Body Container */}
        <div className="wsu-body">
          {/* Sub Navigation Sidebar */}
          <aside className="wsu-sidebar" style={{ width: '250px' }}>
            <div className="wsu-sidebar-section">
              <div className="wsu-sidebar-heading">Registration Services</div>
              {[
                'Serial Number Lookup',
                'Registration Database',
                'Bld Number Lookup',
                'Dummy Serial Number',
                'Product Downloads',
                'Site Licenses'
              ].map((link, idx) => (
                <button
                  key={idx}
                  className={`wsu-sidebar-item ${link === 'Serial Number Lookup' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentPage('registration-database');
                    setActiveRegSubNav(link);
                  }}
                >
                  <span>{link}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Main License Detail Area */}
          <main className="wsu-content">
            <div className="wsu-card">
              <div className="wsu-card-title">
                <span>License Key Summary: {selectedSerialDetail.serialNumber}</span>
                <button className="wsu-btn-secondary" onClick={() => setCurrentPage('wsu-home')} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                  Back to WSU Home
                </button>
              </div>

              {/* License Detail Container Box */}
              <div className="wsu-result-box" style={{ padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.95rem', color: '#000000', marginBottom: '6px' }}>
                  <strong>Serial Number:</strong> <span style={{ fontWeight: 400, color: '#000000' }}>{selectedSerialDetail.serialNumber}</span>
                </div>

                <div style={{ fontSize: '0.95rem', color: '#000000', marginBottom: '14px' }}>
                  <strong>Product Key:</strong> <span style={{ fontWeight: 400, color: '#000000' }}>{selectedSerialDetail.productKey}</span>
                </div>

                <div style={{ fontSize: '0.9rem', color: '#000000', fontWeight: 700, marginBottom: '16px' }}>
                  {selectedSerialDetail.productSummary}
                </div>

                {/* NOTES ALERT BOX */}
                <div className="wsu-alert-notes" style={{ padding: '14px 16px', borderRadius: '4px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#000000', marginBottom: '2px' }}>NOTES:</div>
                  <div style={{ fontWeight: 800, color: '#CC0000', fontSize: '0.85rem' }}>
                    DO NOT SEND THIS INFORMATION TO THE CUSTOMER.
                  </div>
                  <div style={{ fontWeight: 800, color: '#CC0000', fontSize: '0.85rem' }}>
                    This is for Multi User Admins only.
                  </div>
                </div>

                {/* Mass Deployment Information */}
                <div style={{ fontSize: '0.85rem', color: '#000000', lineHeight: 1.6, marginBottom: '16px' }}>
                  <p style={{ marginBottom: '8px' }}>
                    This version can be installed the normal way, or by following these steps for mass deployment:{' '}
                    <a href="http://www.endnote.com/multi" target="_blank" rel="noreferrer" style={{ color: '#5E33BF', fontWeight: 700 }}>
                      http://www.endnote.com/multi
                    </a>
                  </p>
                  <div>- Registration Deadline: <strong>{selectedSerialDetail.regDeadline}</strong></div>
                  <div>- Latest Expiration Date: <strong>{selectedSerialDetail.latestExpDate}</strong></div>
                  <div>This license allows for <strong>{selectedSerialDetail.webSeats} EndNote Web seats</strong>.</div>
                </div>

                {/* Installer Download Links */}
                <div style={{ borderTop: '1px solid #5E33BF', paddingTop: '14px', fontSize: '0.85rem', lineHeight: 1.7 }}>
                  <p style={{ fontWeight: 700, marginBottom: '6px' }}>This product key will allow for installs of both Windows and Macintosh versions.</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span>The user can download a copy of the Windows Installer from:</span>
                    <a href={selectedSerialDetail.winDownload} style={{ color: '#5E33BF', fontWeight: 700 }}>{selectedSerialDetail.winDownload}</a>
                    <button className="wsu-action-btn" onClick={() => handleCopy(selectedSerialDetail.winDownload, 'Windows Installer Link')} style={{ padding: '2px 6px' }}>Copy</button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>The user can download a copy of the Macintosh Installer from:</span>
                    <a href={selectedSerialDetail.macDownload} style={{ color: '#5E33BF', fontWeight: 700 }}>{selectedSerialDetail.macDownload}</a>
                    <button className="wsu-action-btn" onClick={() => handleCopy(selectedSerialDetail.macDownload, 'Macintosh Installer Link')} style={{ padding: '2px 6px' }}>Copy</button>
                  </div>
                </div>
              </div>

              {/* Warning Notice Box */}
              <div className="wsu-warning-box" style={{ padding: '12px', fontWeight: 800, fontSize: '0.85rem', marginBottom: '20px' }}>
                PLEASE NOTE: The above information is a summarization of information for internal use only. Please do NOT simply copy and paste the entire message in an email to an external customer.
              </div>

              {/* System Footer Strip */}
              <div style={{ borderTop: '1px solid #5E33BF', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#000000' }}>
                <button
                  style={{ background: 'none', border: 'none', color: '#5E33BF', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
                  onClick={() => showToast('Error report dialog opened')}
                >
                  Report an Error
                </button>
                <div style={{ fontStyle: 'italic', fontWeight: 600 }}>
                  lookup.pl version 2.3.0. Page generated in 0.5100 seconds
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="wsu-toast">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // PAGE 1: WEB SUPPORT UTILITY (WSU) MAIN PAGE
  // =========================================================================
  return (
    <div className="wsu-layout">
      {/* HEADER BAR */}
      <HeaderBar
        titleText="Web Support Utility (WSU)"
        theme={theme}
        onToggleTheme={toggleTheme}
        onShowToast={showToast}
      />

      {/* BODY CONTENT */}
      <div className="wsu-body">
        {/* SIDEBAR NAVIGATION */}
        <aside className="wsu-sidebar">
          {/* Customers Group */}
          <div className="wsu-sidebar-section">
            <div className="wsu-sidebar-heading">Customers</div>
            {[
              'Search Customers',
              'Customer Associations',
              'Customer Password',
              'Expiration Dates',
              'Groups Sharing',
              'Alter Reference Data',
              'Serial Number Lookup'
            ].map(item => (
              <button
                key={item}
                className={`wsu-sidebar-item ${activeNav === item ? 'active' : ''}`}
                onClick={() => setActiveNav(item)}
              >
                <span>{item}</span>
              </button>
            ))}
          </div>

          {/* Customer Access Group */}
          <div className="wsu-sidebar-section">
            <div className="wsu-sidebar-heading">Customer Access</div>
            {[
              'User Access Lookup',
              'Aggregate Access Lookup',
              'User Temporary Credentials',
              'EndNote Online',
              'EndNote Desktop'
            ].map(item => (
              <button
                key={item}
                className={`wsu-sidebar-item ${activeNav === item ? 'active' : ''}`}
                onClick={() => setActiveNav(item)}
              >
                <span>{item}</span>
              </button>
            ))}
          </div>

          {/* Shared Library Group */}
          <div className="wsu-sidebar-section">
            <div className="wsu-sidebar-heading">Shared Library</div>
            <button
              className={`wsu-sidebar-item ${activeNav === 'Shared Library Lookup' ? 'active' : ''}`}
              onClick={() => setActiveNav('Shared Library Lookup')}
            >
              <span>Shared Library Lookup</span>
            </button>
          </div>

          {/* Market Test Group */}
          <div className="wsu-sidebar-section">
            <div className="wsu-sidebar-heading">Market Test</div>
            <button
              className={`wsu-sidebar-item ${activeNav === 'Market Test Management' ? 'active' : ''}`}
              onClick={() => setActiveNav('Market Test Management')}
            >
              <span>Market Test Management</span>
            </button>
          </div>

          {/* Content Group */}
          <div className="wsu-sidebar-section">
            <div className="wsu-sidebar-heading">Content</div>
            <button
              className={`wsu-sidebar-item ${activeNav === 'Content File Download' ? 'active' : ''}`}
              onClick={() => setActiveNav('Content File Download')}
            >
              <span>Content File Download</span>
            </button>
          </div>

          {/* Help Group */}
          <div className="wsu-sidebar-section">
            <div className="wsu-sidebar-heading">Help</div>
            <button
              className={`wsu-sidebar-item ${activeNav === 'Download Manual' ? 'active' : ''}`}
              onClick={() => setActiveNav('Download Manual')}
            >
              <span>Download Manual</span>
            </button>
            <button
              className={`wsu-sidebar-item ${activeNav === 'Email for Support' ? 'active' : ''}`}
              onClick={() => setActiveNav('Email for Support')}
            >
              <span>Email for Support</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT VIEWS */}
        <main className="wsu-content">
          
          {/* VIEW 1: SEARCH CUSTOMERS */}
          {activeNav === 'Search Customers' && (
            <div>
              <div className="wsu-card">
                <div className="wsu-card-title">
                  <span>Search Customers</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="wsu-btn-secondary" onClick={handleLoadDemo} style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                      Load Demo Data
                    </button>
                    <button className="wsu-btn-secondary" onClick={handleResetSearch} style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                      Clear Form
                    </button>
                  </div>
                </div>

                <form onSubmit={handleCustomerSearch}>
                  <div className="wsu-form-grid">
                    
                    {/* Email Input */}
                    <SmartInputField
                      label="Email*"
                      value={searchEmail}
                      onChange={setSearchEmail}
                      requiredNote={true}
                      fieldLabel="Email"
                      errorMessage={checkSpaceInEmail(searchEmail)}
                    />

                    {/* Steam ID Input */}
                    <SmartInputField
                      label="Steam ID:"
                      value={searchSteamId}
                      onChange={setSearchSteamId}
                      fieldLabel="Steam ID"
                    />

                    {/* UID Input */}
                    <SmartInputField
                      label="UID:"
                      value={searchUid}
                      onChange={setSearchUid}
                      fieldLabel="UID"
                    />

                    {/* Researcher ID Input */}
                    <SmartInputField
                      label="Researcher ID:"
                      value={searchResearcherId}
                      onChange={setSearchResearcherId}
                      fieldLabel="Researcher ID"
                    />

                    {/* Internal ID Input */}
                    <SmartInputField
                      label="Internal ID:"
                      value={searchInternalId}
                      onChange={setSearchInternalId}
                      fieldLabel="Internal ID"
                    />

                    {/* Serial Number Input */}
                    <SmartInputField
                      label="Serial Number:"
                      value={searchSerialNumber}
                      onChange={setSearchSerialNumber}
                      fieldLabel="Serial Number"
                    />
                  </div>

                  {/* Radio Match Options */}
                  <div style={{ marginBottom: '16px' }}>
                    <div className="wsu-label" style={{ marginBottom: '6px' }}>Matching:</div>
                    <div className="wsu-radio-group">
                      <label className="wsu-radio-label">
                        <input
                          type="radio"
                          name="matching"
                          value="exact"
                          checked={matchType === 'exact'}
                          onChange={() => setMatchType('exact')}
                        />
                        <span>entire field is an exact match</span>
                      </label>
                      <label className="wsu-radio-label">
                        <input
                          type="radio"
                          name="matching"
                          value="contains"
                          checked={matchType === 'contains'}
                          onChange={() => setMatchType('contains')}
                        />
                        <span>field contains</span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" className="wsu-btn-primary">
                    Search Customers
                  </button>
                </form>
              </div>

              {/* SEARCH RESULTS TABLE (Only shown after clicking Search Customers or Load Demo Data) */}
              {searchResults !== null && (
                <div className="wsu-card" style={{ marginTop: '20px' }}>
                  <div className="wsu-card-title">
                    <span>Search Results:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#000000' }}>
                      Found {searchResults.length} record(s)
                    </span>
                  </div>

                  {searchResults.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#5E33BF' }}>
                      No customer records matched your query parameters. Try entering query parameters or loading demo data.
                    </div>
                  ) : (
                    <div className="wsu-table-container">
                      <table className="wsu-table">
                        <thead>
                          <tr>
                            <th>First</th>
                            <th>Last</th>
                            <th>Email</th>
                            <th>Steam ID</th>
                            <th>UID</th>
                            <th>Researcher ID</th>
                            <th>Internal ID</th>
                            <th>Serial Number</th>
                            <th>Cust ID</th>
                            <th>Virt Cust ID</th>
                            <th>Cite DB</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.map((row, idx) => (
                            <tr key={idx}>
                              <td>
                                {row.first}
                                <button className="wsu-copy-cell-btn" onClick={() => handleCopy(row.first, 'First Name')}>Copy</button>
                              </td>
                              <td>
                                {row.last}
                                <button className="wsu-copy-cell-btn" onClick={() => handleCopy(row.last, 'Last Name')}>Copy</button>
                              </td>
                              <td>
                                <strong>{row.email}</strong>
                                <button className="wsu-copy-cell-btn" onClick={() => handleCopy(row.email, 'Email')}>Copy</button>
                              </td>
                              <td>
                                {row.steamId}
                                <button className="wsu-copy-cell-btn" onClick={() => handleCopy(row.steamId, 'Steam ID')}>Copy</button>
                              </td>
                              <td>
                                <code>{row.uid}</code>
                                <button className="wsu-copy-cell-btn" onClick={() => handleCopy(row.uid, 'UID')}>Copy</button>
                              </td>
                              <td>
                                {row.researcherId}
                                <button className="wsu-copy-cell-btn" onClick={() => handleCopy(row.researcherId, 'Researcher ID')}>Copy</button>
                              </td>
                              <td>
                                {row.internalId}
                                <button className="wsu-copy-cell-btn" onClick={() => handleCopy(row.internalId, 'Internal ID')}>Copy</button>
                              </td>
                              <td>
                                <button
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#5E33BF',
                                    fontWeight: 'bold',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit'
                                  }}
                                  onClick={() => handleOpenSerialDetail(row)}
                                >
                                  {row.serialNumber}
                                </button>
                                <button className="wsu-copy-cell-btn" onClick={() => handleCopy(row.serialNumber, 'Serial Number')}>Copy</button>
                              </td>
                              <td>{row.custId}</td>
                              <td>{row.virtCustId}</td>
                              <td>{row.citeDb}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* RED BOX BUTTON: SERIAL NUMBER LOOKUP / REGISTRATION DATABASE */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                <button
                  className="wsu-btn-primary"
                  onClick={() => {
                    setCurrentPage('registration-database');
                    showToast('Navigated to Registration Database Page');
                  }}
                  style={{
                    borderRadius: '10px',
                    padding: '12px 28px',
                    fontSize: '0.89rem',
                    fontWeight: 400,
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)'
                  }}
                >
                  Serial Number Lookup / Registration Database
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: USER ACCESS LOOKUP */}
          {activeNav === 'User Access Lookup' && (
            <div className="wsu-card">
              <div className="wsu-card-title">User Access Lookup</div>
              <p style={{ fontSize: '0.85rem', color: '#000000', marginBottom: '16px', fontWeight: 600 }}>
                Displays the 100 most recent EN Services Auth Tokens
              </p>

              <div className="wsu-form-grid" style={{ marginBottom: '24px' }}>
                <SmartInputField
                  label="Email:"
                  value={accessSearchEmail}
                  onChange={setAccessSearchEmail}
                  fieldLabel="Search Email"
                />

                <SmartInputField
                  label="UID:"
                  value={accessSearchUid}
                  onChange={setAccessSearchUid}
                  fieldLabel="Search UID"
                />
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#5E33BF', marginBottom: '14px' }}>
                100 Most Recent Sessions for {accessSearchEmail || 'all users'}
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <span>Show</span>
                  <select
                    value={showEntriesCount}
                    onChange={(e) => setShowEntriesCount(e.target.value)}
                    style={{ padding: '4px 8px', border: '2px solid #000000', background: '#F0F0EB', fontFamily: 'inherit', fontWeight: 700 }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>entries</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <span className="wsu-label">Search:</span>
                  <div style={{ width: '220px' }}>
                    <SmartInputField
                      value={accessFilterQuery}
                      onChange={setAccessFilterQuery}
                      fieldLabel="Token Filter"
                    />
                  </div>
                </div>
              </div>

              <div className="wsu-table-container">
                <table className="wsu-table">
                  <thead>
                    <tr>
                      <th>Auth Token</th>
                      <th>UID</th>
                      <th>Client Name</th>
                      <th>Date Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuthTokens.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <code>{item.authToken}</code>
                          <button className="wsu-copy-cell-btn" onClick={() => handleCopy(item.authToken, 'Auth Token')}>
                            Copy
                          </button>
                        </td>
                        <td>
                          <code>{item.uid}</code>
                          <button className="wsu-copy-cell-btn" onClick={() => handleCopy(item.uid, 'UID')}>
                            Copy
                          </button>
                        </td>
                        <td>
                          <strong>{item.clientName}</strong>
                        </td>
                        <td>{item.dateCreated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: OTHER NAV VIEWS */}
          {![
            'Search Customers',
            'User Access Lookup'
          ].includes(activeNav) && (
            <div className="wsu-card">
              <div className="wsu-card-title">{activeNav}</div>
              <p style={{ fontSize: '0.9rem', color: '#000000', marginBottom: '16px' }}>
                Web Support Utility customer support management view for <strong>{activeNav}</strong>.
              </p>
              
              <div style={{ maxWidth: '450px', marginBottom: '16px' }}>
                <SmartInputField
                  label="Search Query / Reference ID:"
                  value={genericQuery}
                  onChange={setGenericQuery}
                  fieldLabel="Query"
                />
              </div>

              <button className="wsu-btn-primary" onClick={() => showToast(`Executed ${activeNav} task`)}>
                Execute {activeNav}
              </button>
            </div>
          )}

        </main>
      </div>

      {/* TOAST */}
      {toastMessage && (
        <div className="wsu-toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
