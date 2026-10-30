import React, { useState, useEffect, useRef } from 'react';
import { CUSTOMER_DATABASE, AUTH_TOKENS_LIST, SERIAL_NUMBERS_DATABASE, CUSTOMER_ASSOCIATIONS, UNIVERSITY_LIST } from './mockData';
import SiteLicensesView from './SiteLicensesView';
import CustomerPasswordView from './CustomerPasswordView';
import GroupsSharingView from './GroupsSharingView';
import AlterReferenceDataView from './AlterReferenceDataView';
import SerialNumberHistoryLookupView from './SerialNumberHistoryLookupView';
import UserAccessLookupView from './UserAccessLookupView';
import AggregateAccessLookupView from './AggregateAccessLookupView';
import UserTemporaryCredentialsView from './UserTemporaryCredentialsView';
import EndNoteOnlineAccessView from './EndNoteOnlineAccessView';
import EndNoteDesktopBuilderView from './EndNoteDesktopBuilderView';
import { undoManager } from './undoManager';
import LoginView from './LoginView';
import InvalidEmailModal, { isValidEmail } from './InvalidEmailModal';
import { getEndNoteVersionFromSN, isValidSerialNumber, isValidProductKey, generate25DigitProductKey, generateSerialForVersion } from './serialNumberUtil';

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

// Downloads list extracted directly from Product Downloads tool specification
const PRODUCT_DOWNLOADS_LIST = [
  { product: 'EndNote 2025 Windows Single User', url: 'https://download.endnote.com/downloads/2025/EN2025Inst.exe' },
  { product: 'EndNote 2025 Windows Volume', url: 'https://download.endnote.com/downloads/2025/EN2025Inst.msi' },
  { product: 'EndNote 2025 Macintosh Single User', url: 'https://download.endnote.com/downloads/2025/EndNote2025Installer.dmg' },
  { product: 'EndNote 21 Windows Single User', url: 'https://download.endnote.com/downloads/21/EN21Inst.exe' },
  { product: 'EndNote 21 Windows Volume', url: 'https://download.endnote.com/downloads/21/EN21Inst.msi' },
  { product: 'EndNote 21 Macintosh Single User', url: 'https://download.endnote.com/downloads/21/EndNote21Installer.dmg' },
  { product: 'EndNote 20 Windows Single User', url: 'https://download.endnote.com/downloads/20/EN20Inst.exe' },
  { product: 'EndNote 20 Windows Volume', url: 'https://download.endnote.com/downloads/20/EN20Inst.msi' },
  { product: 'EndNote 20 Macintosh Single User', url: 'https://download.endnote.com/downloads/20/EndNote20Installer.dmg' },
  { product: 'EndNote 19 Windows Single User', url: 'https://download.endnote.com/downloads/X9/ENX9Inst.exe' },
  { product: 'EndNote 19 Windows Volume', url: 'https://download.endnote.com/downloads/X9/ENX9Inst.msi' },
  { product: 'EndNote 19 Macintosh Single User', url: 'https://download.endnote.com/downloads/X9/EndNoteX9Installer.dmg' },
  { product: 'EndNote 18 Windows Single User', url: 'https://download.endnote.com/downloads/X8/ENX8Inst.exe' },
  { product: 'EndNote 18 Windows Volume', url: 'https://download.endnote.com/downloads/X8/ENX8Inst.msi' },
  { product: 'EndNote 18 Macintosh Single User', url: 'https://download.endnote.com/downloads/X8/EndNoteX8Installer.dmg' },
  { product: 'EndNote 17 Windows Single User', url: 'https://download.endnote.com/downloads/X7/ENX7Inst.exe' },
  { product: 'EndNote 17 Windows Volume', url: 'https://download.endnote.com/downloads/X7/ENX7Inst.msi' },
  { product: 'EndNote 17 Macintosh Single User', url: 'https://download.endnote.com/downloads/X7/EndNoteX7Installer.dmg' },
  { product: 'EndNote 17 Macintosh Volume', url: 'https://download.endnote.com/downloads/X7/EndNoteX7Installer.dmg' },
  { product: 'EndNote 16 Windows Single User', url: 'https://download.endnote.com/downloads/X6/ENX6Inst.exe' },
  { product: 'EndNote 16 Windows Volume', url: 'https://download.endnote.com/downloads/X6/ENX6Inst.msi' },
  { product: 'EndNote 16 Macintosh Single User', url: 'https://download.endnote.com/downloads/X6/EndNoteX6Installer.dmg' },
  { product: 'EndNote 16 Macintosh Volume', url: 'https://download.endnote.com/downloads/X6/EndNoteX6Installer.dmg' },
  { product: 'EndNote 15 Windows Single User', url: 'https://download.endnote.com/downloads/X5/ENX5Inst.exe' },
  { product: 'EndNote 15 Windows Volume', url: 'https://download.endnote.com/downloads/X5/ENX5Inst.msi' },
  { product: 'EndNote 15 Macintosh Single User', url: 'https://download.endnote.com/downloads/X5/EndNoteX5Installer.dmg' },
  { product: 'EndNote 15 Macintosh Volume', url: 'https://download.endnote.com/downloads/X5/EndNoteX5Installer.dmg' },
  { product: 'EndNote 14 Windows Single User', url: 'https://download.endnote.com/downloads/X4/ENX4Inst.exe' },
  { product: 'EndNote 14 Windows Volume', url: 'https://download.endnote.com/downloads/X4/ENX4Inst.msi' },
  { product: 'EndNote 14 Macintosh Single User', url: 'https://download.endnote.com/downloads/X4/EndNoteX4Installer.dmg' },
  { product: 'EndNote 14 Macintosh Volume', url: 'https://download.endnote.com/downloads/X4/EndNoteX4Installer.dmg' },
  { product: 'EndNote 13 Windows Single User', url: 'https://download.endnote.com/downloads/X3/ENX3Inst.exe' },
  { product: 'EndNote 13 Windows Volume', url: 'https://download.endnote.com/downloads/X3/ENX3Inst.msi' },
  { product: 'EndNote 13 Macintosh Single User', url: 'https://download.endnote.com/downloads/X3/EndNoteX3Installer.dmg' },
  { product: 'EndNote 13 Macintosh Volume', url: 'https://download.endnote.com/downloads/X3/EndNoteX3Installer.dmg' },
  { product: 'EndNote 12 Windows Single User', url: 'https://download.endnote.com/downloads/X2/ENX2Inst.exe' },
  { product: 'EndNote 12 Windows Volume', url: 'https://download.endnote.com/downloads/X2/ENX2Inst.msi' },
  { product: 'EndNote 12 Macintosh Single User', url: 'http://download.endnote.com/downloads/X2/EndNoteX2Installer.dmg' },
  { product: 'EndNote 12 Macintosh Volume', url: 'https://download.endnote.com/downloads/X2/EndNoteX2Installer.dmg' },
  { product: 'EndNote 11 Windows Single User', url: 'https://download.endnote.com/downloads/X1/ENX1Inst.exe' },
  { product: 'EndNote 11 Windows Volume', url: 'https://download.endnote.com/downloads/X1/ENX1Inst.msi' },
  { product: 'EndNote 11 Macintosh Single User', url: 'https://download.endnote.com/downloads/X1/EndNoteX1Installer.dmg' },
  { product: 'EndNote 11 Macintosh Volume', url: 'https://download.endnote.com/downloads/X1/EndNoteX1Installer.dmg' },
  { product: 'EndNote 10 Windows Single User (2011040704)', url: 'https://download.endnote.com/downloads/X/ENXInst.exe' },
  { product: 'EndNote 10 Windows Volume', url: 'https://download.endnote.com/downloads/X/ENXSiteInst.msi' },
  { product: 'EndNote 10 Macintosh Single User (2011040704)', url: 'https://download.endnote.com/downloads/X/EndNoteXFullInstaller.dmg' },
  { product: 'EndNote 10 Macintosh Volume', url: 'https://download.endnote.com/downloads/X/EndNoteXVolumeInstaller.dmg' },
  { product: 'Reference Manager 12 Single User', url: 'https://download.refman.com/downloads/refman/12.0/Refman1203.exe' },
  { product: 'Reference Manager 12 Single User MSI', url: 'https://download.refman.com/downloads/refman/12.0/Refman1203.msi' },
  { product: 'Reference Manager 12 Network', url: 'https://download.refman.com/downloads/refman/12.0/Refman1203Net.exe' },
  { product: 'Reference Manager 12 Network MSI', url: 'https://download.refman.com/downloads/refman/12.0/Refman1203Net.msi' }
];

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
  onPaste,
  afterButton = null,
  historyKey = null,
  inlineLabel = false,
  labelWidth = '130px',
  maxLength = null,
  inputMode = undefined,
  placeholder = "",
  onKeyDown = null
}) => {
  const valStr = value !== undefined && value !== null ? String(value) : '';
  const hasValue = valStr.trim().length > 0;
  const inputElRef = React.useRef(null);
  const [showHistory, setShowHistory] = React.useState(false);
  const [history, setHistory] = React.useState([]);
  const [wasCopied, setWasCopied] = React.useState(false);

  React.useEffect(() => {
    setWasCopied(false);
  }, [valStr]);

  const isCopyMode = Boolean(hasValue && !wasCopied);

  const fieldId = React.useMemo(
    () => historyKey || fieldLabel || label || 'field_' + Math.random().toString(36).slice(2, 7),
    [historyKey, fieldLabel, label]
  );

  const loadHistory = () => {
    if (!historyKey) return [];
    try { return JSON.parse(localStorage.getItem(`wsu_history_${historyKey}`) || '[]'); }
    catch { return []; }
  };

  const handleFocus = () => {
    if (!historyKey) return;
    const h = loadHistory();
    setHistory(h);
    if (h.length > 0) setShowHistory(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowHistory(false), 180);
  };

  const handleSelectHistory = (val) => {
    onChange(val);
    setShowHistory(false);
  };

  const handleClearAllHistory = () => {
    if (!historyKey) return;
    try {
      localStorage.removeItem(`wsu_history_${historyKey}`);
    } catch {}
    setHistory([]);
    setShowHistory(false);
    undoManager.showToast(`Cleared recent searches for ${fieldLabel || label || 'field'}`);
  };

  const handleRemoveHistoryItem = (itemToRemove) => {
    if (!historyKey) return;
    const updated = history.filter((h) => h !== itemToRemove);
    try {
      localStorage.setItem(`wsu_history_${historyKey}`, JSON.stringify(updated));
    } catch {}
    setHistory(updated);
    if (updated.length === 0) {
      setShowHistory(false);
    }
    undoManager.showToast(`Removed from recent searches`);
  };

  const handleCopyOrPaste = async () => {
    if (isCopyMode) {
      if (onCopy) {
        onCopy(valStr, fieldLabel || label || 'field content');
      } else {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
            await navigator.clipboard.writeText(valStr);
          } catch {}
        }
        undoManager.showToast(`Copied ${fieldLabel || label || 'content'}: ${valStr}`);
      }
      setWasCopied(true);
    } else {
      const applyPaste = (text) => {
        if (text) {
          onChange(text);
          undoManager.showToast(`Pasted into ${fieldLabel || label || 'field'}`);
          setWasCopied(false);
        }
      };

      if (onPaste) {
        onPaste(applyPaste, fieldLabel || label || 'field');
      } else {
        if (navigator.clipboard && navigator.clipboard.readText) {
          try {
            const text = await navigator.clipboard.readText();
            applyPaste(text);
          } catch {
            undoManager.showToast('Clipboard paste permission required');
          }
        }
      }
    }
  };

  const handleClearClick = () => {
    if (!hasValue) return;
    undoManager.pushCleared(
      fieldId,
      valStr,
      onChange,
      inputElRef.current,
      fieldLabel || label || 'field'
    );
    onChange('');
    setWasCopied(false);
  };

  return (
    <div
      className="wsu-input-group"
      style={{
        ...style,
        position: 'relative',
        display: inlineLabel ? 'flex' : 'block',
        alignItems: inlineLabel ? 'center' : 'stretch',
        gap: inlineLabel ? '12px' : '0'
      }}
    >
      {label && (
        <label
          className="wsu-label"
          style={{
            fontWeight: 700,
            width: inlineLabel ? labelWidth : 'auto',
            minWidth: inlineLabel ? labelWidth : 'auto',
            marginBottom: inlineLabel ? '0' : '6px',
            color: '#000000',
            textAlign: 'left',
            display: 'block'
          }}
        >
          {label}
        </label>
      )}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: '8px', flex: 1 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: inlineLabel ? '460px' : 'none' }}>
          <div
            className="wsu-input-wrapper"
            style={errorMessage ? { borderColor: '#000000', boxShadow: '0 0 0 1px #000000' } : {}}
          >
            <input
              ref={inputElRef}
              data-field={fieldId}
              type={type}
              className="wsu-input"
              value={valStr}
              maxLength={maxLength || undefined}
              inputMode={inputMode}
              placeholder={placeholder}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (onKeyDown) {
                  onKeyDown(e);
                  if (e.defaultPrevented) return;
                }
                const isCtrlOrMeta = e.ctrlKey || e.metaKey;
                const k = e.key ? e.key.toLowerCase() : '';
                const isShift = e.shiftKey;
                if ((isCtrlOrMeta && isShift && (k === 'z' || k === 'u')) || (isCtrlOrMeta && k === 'y')) {
                  e.preventDefault();
                  undoManager.redoField(fieldId);
                } else if (isCtrlOrMeta && (k === 'z' || k === 'u')) {
                  e.preventDefault();
                  undoManager.undoField(fieldId);
                }
              }}
              autoComplete="off"
              spellCheck="false"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <div className="wsu-action-btn-group">
              <button
                type="button"
                className="wsu-action-btn"
                onClick={handleCopyOrPaste}
                title={isCopyMode ? 'Copy to clipboard' : 'Paste from clipboard'}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {isCopyMode ? 'Copy' : 'Paste'}
              </button>
              <button
                type="button"
                className="wsu-action-btn wsu-action-btn-clear"
                onClick={handleClearClick}
                title="Clear field (Ctrl+Z or U to return back)"
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Clear
              </button>
            </div>
          </div>


          {/* Recent Search History Dropdown */}
          {showHistory && history.length > 0 && (
            <div className="wsu-history-dropdown">
              <div className="wsu-history-header">
                <span>Recent Searches</span>
                <button
                  type="button"
                  className="wsu-history-clear-all-btn"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClearAllHistory();
                  }}
                  title="Clear all past history for this field in one click"
                >
                  Clear all
                </button>
              </div>
              {history.map((item, i) => (
                <div
                  key={i}
                  className="wsu-history-item"
                  onMouseDown={() => handleSelectHistory(item)}
                >
                  <div className="wsu-history-item-content">
                    <span className="wsu-history-icon">🕐</span>
                    <span className="wsu-history-text">{item}</span>
                  </div>
                  <button
                    type="button"
                    className="wsu-history-item-del-btn"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveHistoryItem(item);
                    }}
                    title={`Clear "${item}" from history in one click`}
                    aria-label={`Clear ${item} from history`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {afterButton}
      </div>
      {errorMessage ? (
        <div style={{ fontSize: '0.72rem', color: '#000000', fontWeight: 600, marginTop: '4px' }}>
          ⚠️ {errorMessage}
        </div>
      ) : (
        requiredNote && (
          <span className="wsu-note-text" style={{ fontSize: '0.69rem', fontStyle: 'italic' }}>

          </span>
        )
      )}
    </div>
  );
};


// Top-level Header Bar Component
const HeaderBar = ({
  titleText,
  backActionText,
  onBackClick,
  onShowToast,
  theme,
  onToggleTheme,
  centerAction,
  userEmail,
  sessionTimer,
  onLogout
}) => {
  const emailToDisplay = userEmail || 'padmanabha.roy@clarivate.com';
  const isLongEmail = emailToDisplay.length > 25;
  const rawSliced = emailToDisplay.slice(0, 25);
  const baseSliced = rawSliced.endsWith('.') ? rawSliced.slice(0, -1) : rawSliced;
  const truncatedEmail = isLongEmail ? `${baseSliced}...` : emailToDisplay;

  const centerContent = centerAction || (backActionText && onBackClick ? (
    <button
      type="button"
      className="wsu-btn-primary"
      onClick={onBackClick}
      style={{
        padding: '6px 18px',
        fontSize: '0.82rem',
        fontWeight: 600,
        letterSpacing: '0.2px'
      }}
    >
      {backActionText}
    </button>
  ) : null);

  return (
    <header className="wsu-header">
      <div className="wsu-header-left">
        <div className="wsu-header-logo-container">
          <img
            src="/clarivate-logo.svg"
            alt="Clarivate Logo"
            className="wsu-header-logo"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
        <div className="wsu-header-title">
          <span>{titleText || 'Web Support Utility (WSU)'}</span>
        </div>
      </div>

      <div className="wsu-header-center">
        {centerContent}
      </div>

      <div className="wsu-header-right">
        <div className="wsu-header-user-wrapper">
          <div className="wsu-header-user">
            <span
              className="wsu-header-user-email"
              title={emailToDisplay}
              data-tooltip={isLongEmail ? emailToDisplay : undefined}
            >
              {truncatedEmail}
            </span>
          </div>
          {sessionTimer && (
            <div className="wsu-header-session-timer">
              {sessionTimer}
            </div>
          )}
        </div>
        <button className="wsu-header-link" onClick={() => onShowToast && onShowToast('Password change form opened')}>
          Change Password
        </button>
        <span>|</span>
        <button className="wsu-header-link" onClick={onLogout || (() => onShowToast && onShowToast('User logged out'))}>
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
};

// Detect initial page view from URL query parameter or hash
const detectInitialPage = () => {
  if (typeof window === 'undefined') return 'wsu-home';
  const params = new URLSearchParams(window.location.search);
  const p = params.get('page') || params.get('view');
  if (p === 'registration-database' || p === 'sln') {
    return 'registration-database';
  }
  const hash = (window.location.hash || '').toLowerCase();
  if (hash.includes('registration-database') || hash.includes('sln')) {
    return 'registration-database';
  }
  return 'wsu-home';
};

const AUTH_SESSION_KEY = 'clarivate_wsu_auth_session';
const SESSION_DURATION_SECONDS = 30 * 60; // 30 minutes in seconds

const getStoredSession = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.expiresAt || !parsed.email) return null;
    if (Date.now() >= parsed.expiresAt) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
};

export default function App() {
  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState(() => {
    const sess = getStoredSession();
    return sess ? sess.email : null;
  });
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    const sess = getStoredSession();
    if (sess) {
      return Math.max(0, Math.floor((sess.expiresAt - Date.now()) / 1000));
    }
    return 0;
  });

  // Page View state: 'wsu-home' | 'registration-database' | 'serial-detail'
  // Requirement: After login, the WSU will open up by default
  const [currentPage, setCurrentPage] = useState(detectInitialPage);
  const [showInvalidEmailModal, setShowInvalidEmailModal] = useState(false);

  // Cross-tab window reference for SLN
  const slnWindowRef = useRef(null);

  const formatTimer = (totalSec) => {
    if (totalSec <= 0) return '00:00:00';
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleLogin = (email) => {
    const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
    const session = {
      email,
      loginTime: Date.now(),
      expiresAt
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    setCurrentUser(email);
    setRemainingSeconds(SESSION_DURATION_SECONDS);
    setSessionExpiredMsg('');

    // Requirement: After login, the WSU will open up by default
    setCurrentPage('wsu-home');
    window.name = 'clarivate_wsu_window';
    document.title = 'Clarivate - Web Support Utility (WSU)';
    if (window.location.search || window.location.hash) {
      try {
        window.history.replaceState({}, 'Clarivate - Web Support Utility (WSU)', window.location.pathname);
      } catch (e) {}
    }
    showToast(`Logged in as ${email}. Session active for 30 minutes.`);

    try {
      const ch = new BroadcastChannel('clarivate_wsu_auth_channel');
      ch.postMessage({ type: 'LOGIN', session });
      ch.close();
    } catch (e) {}
  };

  const handleLogout = (isExpired = false) => {
    localStorage.removeItem(AUTH_SESSION_KEY);
    const reason = isExpired ? 'expired' : 'user';

    // Broadcast LOGOUT immediately to all open windows/tabs
    try {
      const ch = new BroadcastChannel('clarivate_wsu_auth_channel');
      ch.postMessage({ type: 'LOGOUT', reason });
      ch.close();
    } catch (e) {}

    // Check if this window is a secondary window (e.g. SLN Lookup / Reg Database popup)
    const isSecondary =
      window.name === 'clarivate_sln_window' ||
      currentPage === 'registration-database' ||
      currentPage === 'serial-detail' ||
      (window.opener && !window.opener.closed);

    if (isSecondary) {
      // Focus opener (main WSU window) and close this window so only single page remains
      if (window.opener && !window.opener.closed) {
        try { window.opener.focus(); } catch (e) {}
      }
      try {
        window.close();
      } catch (e) {}
    }

    // If this is the main window, close the secondary window if it is open
    if (slnWindowRef.current && !slnWindowRef.current.closed) {
      try {
        slnWindowRef.current.close();
      } catch (e) {}
    }

    // Reset session and return to single page login menu
    setCurrentUser(null);
    setRemainingSeconds(0);
    setCurrentPage('wsu-home');
    window.name = 'clarivate_wsu_window';
    document.title = 'Clarivate - Web Support Utility (WSU)';
    if (window.location.search || window.location.hash) {
      try {
        window.history.replaceState({}, 'Clarivate - Web Support Utility (WSU)', window.location.pathname);
      } catch (e) {}
    }

    if (isExpired) {
      setSessionExpiredMsg('Session expired. Please log in again.');
      showToast('Session expired. Please log in again.');
    } else {
      setSessionExpiredMsg('');
      showToast('User logged out');
    }

    try {
      window.focus();
    } catch (e) {}
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (!currentUser) return;

    const checkTimer = () => {
      const sess = getStoredSession();
      if (!sess) {
        handleLogout(true);
        return;
      }
      const diff = Math.max(0, Math.floor((sess.expiresAt - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        handleLogout(true);
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [currentUser, currentPage]);

  // Cross-tab Authentication Synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === AUTH_SESSION_KEY) {
        if (!e.newValue) {
          // Session was removed or expired in another window
          const isSecondary =
            window.name === 'clarivate_sln_window' ||
            currentPage === 'registration-database' ||
            currentPage === 'serial-detail' ||
            (window.opener && !window.opener.closed);

          if (isSecondary) {
            if (window.opener && !window.opener.closed) {
              try { window.opener.focus(); } catch (e) {}
            }
            try {
              window.close();
            } catch (e) {}
          }

          if (slnWindowRef.current && !slnWindowRef.current.closed) {
            try {
              slnWindowRef.current.close();
            } catch (e) {}
          }

          setCurrentUser(null);
          setRemainingSeconds(0);
          setCurrentPage('wsu-home');
          window.name = 'clarivate_wsu_window';
          document.title = 'Clarivate - Web Support Utility (WSU)';
          if (window.location.search || window.location.hash) {
            try {
              window.history.replaceState({}, 'Clarivate - Web Support Utility (WSU)', window.location.pathname);
            } catch (e) {}
          }
          setSessionExpiredMsg('Session expired. Please log in again.');
          try { window.focus(); } catch (e) {}
        } else {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed && parsed.expiresAt > Date.now()) {
              setCurrentUser(parsed.email);
              setRemainingSeconds(Math.max(0, Math.floor((parsed.expiresAt - Date.now()) / 1000)));
              setSessionExpiredMsg('');
              setCurrentPage('wsu-home');
              window.name = 'clarivate_wsu_window';
              document.title = 'Clarivate - Web Support Utility (WSU)';
              if (window.location.search || window.location.hash) {
                try {
                  window.history.replaceState({}, 'Clarivate - Web Support Utility (WSU)', window.location.pathname);
                } catch (e) {}
              }
            } else {
              handleLogout(true);
            }
          } catch (err) {}
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    let authChannel;
    try {
      authChannel = new BroadcastChannel('clarivate_wsu_auth_channel');
      authChannel.onmessage = (event) => {
        if (!event.data) return;
        if (event.data.type === 'LOGIN') {
          const sess = event.data.session;
          setCurrentUser(sess.email);
          setRemainingSeconds(Math.max(0, Math.floor((sess.expiresAt - Date.now()) / 1000)));
          setSessionExpiredMsg('');
          setCurrentPage('wsu-home');
          window.name = 'clarivate_wsu_window';
          document.title = 'Clarivate - Web Support Utility (WSU)';
          if (window.location.search || window.location.hash) {
            try {
              window.history.replaceState({}, 'Clarivate - Web Support Utility (WSU)', window.location.pathname);
            } catch (e) {}
          }
        } else if (event.data.type === 'LOGOUT') {
          const isSecondary =
            window.name === 'clarivate_sln_window' ||
            currentPage === 'registration-database' ||
            currentPage === 'serial-detail' ||
            (window.opener && !window.opener.closed);

          if (isSecondary) {
            if (window.opener && !window.opener.closed) {
              try { window.opener.focus(); } catch (e) {}
            }
            try {
              window.close();
            } catch (e) {}
          }

          if (slnWindowRef.current && !slnWindowRef.current.closed) {
            try {
              slnWindowRef.current.close();
            } catch (e) {}
          }

          setCurrentUser(null);
          setRemainingSeconds(0);
          setCurrentPage('wsu-home');
          window.name = 'clarivate_wsu_window';
          document.title = 'Clarivate - Web Support Utility (WSU)';
          if (window.location.search || window.location.hash) {
            try {
              window.history.replaceState({}, 'Clarivate - Web Support Utility (WSU)', window.location.pathname);
            } catch (e) {}
          }

          if (event.data.reason === 'expired') {
            setSessionExpiredMsg('Session expired. Please log in again.');
          } else {
            setSessionExpiredMsg('');
          }

          try {
            window.focus();
          } catch (e) {}
        }
      };
    } catch (e) {}

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (authChannel) authChannel.close();
    };
  }, [currentPage]);

  // Theme State ('light' | 'dark') - default is strictly 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('clarivate_wsu_theme') || 'light';
  });

  useEffect(() => {
    if (!currentUser) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('clarivate_wsu_theme', theme);
    }
  }, [theme, currentUser]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
  };

  // Sync Window Name and Document Title based on active page
  useEffect(() => {
    if (currentPage === 'registration-database' || currentPage === 'serial-detail') {
      window.name = 'clarivate_sln_window';
      document.title = 'Clarivate - Registration Database & SLN Lookup';
    } else {
      window.name = 'clarivate_wsu_window';
      document.title = 'Clarivate - Web Support Utility (WSU)';
    }
  }, [currentPage]);

  // Inter-tab BroadcastChannel listener to bring appropriate window to front without opening duplicates
  useEffect(() => {
    let channel;
    try {
      channel = new BroadcastChannel('clarivate_wsu_nav_channel');
      channel.onmessage = (event) => {
        if (!event.data) return;
        if (event.data.type === 'FOCUS_WSU' && currentPage === 'wsu-home') {
          window.focus();
        } else if (event.data.type === 'FOCUS_SLN' && (currentPage === 'registration-database' || currentPage === 'serial-detail')) {
          window.focus();
        }
      };
    } catch (e) {
      // BroadcastChannel unsupported or restricted
    }
    return () => {
      if (channel) channel.close();
    };
  }, [currentPage]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(detectInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 1. Open / Switch to SLN in a dedicated separate window/tab (reusing existing tab if open)
  const openSlnPage = () => {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const slnUrl = `${baseUrl}?page=registration-database`;

    window.name = 'clarivate_wsu_window';

    try {
      const channel = new BroadcastChannel('clarivate_wsu_nav_channel');
      channel.postMessage({ type: 'FOCUS_SLN' });
      channel.close();
    } catch (e) {}

    if (slnWindowRef.current && !slnWindowRef.current.closed) {
      try {
        slnWindowRef.current.focus();
      } catch (e) {}
      const win = window.open('', 'clarivate_sln_window');
      if (win) {
        try { win.focus(); } catch (e) {}
      }
    } else {
      slnWindowRef.current = window.open(slnUrl, 'clarivate_sln_window');
      if (slnWindowRef.current) {
        try {
          slnWindowRef.current.focus();
        } catch (e) {}
      }
    }

    showToast('Switched to SLN Lookup / Registration Database');
  };

  // 2. Revert back to the already opened WSU page without opening duplicate copies or reloading
  const revertToWsuPage = () => {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const wsuUrl = `${baseUrl}`;

    try {
      const channel = new BroadcastChannel('clarivate_wsu_nav_channel');
      channel.postMessage({ type: 'FOCUS_WSU' });
      channel.close();
    } catch (e) {}

    let openerAlive = false;
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.focus();
        openerAlive = true;
      } catch (e) {}
    }

    // Using '' targets existing 'clarivate_wsu_window' without triggering a page reload
    const targetUrl = openerAlive ? '' : wsuUrl;
    const wsuWin = window.open(targetUrl, 'clarivate_wsu_window');
    if (wsuWin) {
      try {
        wsuWin.focus();
      } catch (e) {}
    }

    showToast('Reverted to Web Support Utility');
  };

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
  const [isSnBuffering, setIsSnBuffering] = useState(false);
  const [snLookupError, setSnLookupError] = useState('');
  const snBufferTimeoutRef = useRef(null);

  // Dummy Serial Number Generator Form State
  const [dummyProduct, setDummyProduct] = useState('EndNote');
  const [dummyVersion, setDummyVersion] = useState('22');
  const [dummyPlatform, setDummyPlatform] = useState('Hybrid');
  const [dummyType, setDummyType] = useState('Full Download');
  const [generatedDummyResult, setGeneratedDummyResult] = useState(null);

  // Bld Number Lookup State
  const [bldNumberInput, setBldNumberInput] = useState('');
  const [bldLookupResult, setBldLookupResult] = useState(null);

  // Generic Nav Input State
  const [genericQuery, setGenericQuery] = useState('');

  // Expiration Dates State
  const [expirationCustomer, setExpirationCustomer] = useState(null);
  const [expirationEmail, setExpirationEmail] = useState('');
  const [newDesktopMonth, setNewDesktopMonth] = useState('July');
  const [newDesktopDay, setNewDesktopDay] = useState('28');
  const [newDesktopYear, setNewDesktopYear] = useState('2028');
  const [newIpMonth, setNewIpMonth] = useState('October');
  const [newIpDay, setNewIpDay] = useState('21');
  const [newIpYear, setNewIpYear] = useState('2027');

  // Customer Associations State
  const [associationsEmail, setAssociationsEmail] = useState('');
  const [associationsRows, setAssociationsRows] = useState(null);
  const [assocChecked, setAssocChecked] = useState({});
  const [assocAllChecked, setAssocAllChecked] = useState(false);
  const [assocAddUniversity, setAssocAddUniversity] = useState(UNIVERSITY_LIST[0]);

  // Toast notification trigger
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  useEffect(() => {
    undoManager.setToastHandler(showToast);
  }, []);

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
    const randSN = customFields.serialNumber || generateSerialForVersion('22');
    const endnoteVer = getEndNoteVersionFromSN(randSN);
    const randKey = customFields.productKey || generate25DigitProductKey();

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
      state: endnoteVer.includes('2025') ? 'EN2025' : endnoteVer.replace('EndNote ', 'EN'),
      endnoteVersion: `${endnoteVer} (${endnoteVer.includes('2025') ? 'EN2025' : endnoteVer.replace('EndNote ', 'EN')})`,
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
      productSummary: `This is a Multi User Download of ${endnoteVer} for Both Mac & Windows.`,
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

    // Validate email format
    if (searchEmail.trim() !== '' && !isValidEmail(searchEmail.trim())) {
      setShowInvalidEmailModal(true);
      return;
    }

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

    // Save non-empty field values to per-field search history
    const saveHist = (key, val) => {
      if (!key || !String(val).trim()) return;
      try {
        const stored = JSON.parse(localStorage.getItem(`wsu_history_${key}`) || '[]');
        const v = String(val).trim();
        const updated = [v, ...stored.filter(s => s !== v)].slice(0, 5);
        localStorage.setItem(`wsu_history_${key}`, JSON.stringify(updated));
      } catch {}
    };
    saveHist('email', searchEmail);
    saveHist('serialNumber', searchSerialNumber);
    saveHist('steamId', searchSteamId);
    saveHist('uid', searchUid);
    saveHist('researcherId', searchResearcherId);
    saveHist('internalId', searchInternalId);
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

  // Open Expiration Dates view for a customer (triggered by clicking Serial Number in Search Results)
  const handleOpenExpirationDates = (cust) => {
    setExpirationCustomer(cust);
    setExpirationEmail(cust.email || '');
    setActiveNav('Expiration Dates');
    showToast(`Viewing expiration dates for ${cust.email}`);
  };

  // Handle Serial Number or Product Key Lookup Form Submission
  const handleSNLookupSubmit = (e) => {
    if (e) e.preventDefault();
    if (isSnBuffering) return;

    const rawInput = (snLookupInput || '').trim();
    if (!rawInput) {
      setSnLookupError('Please enter a 10-digit Serial Number or 25-character Product Key.');
      setSnLookupResult(null);
      showToast('Please enter a Serial Number or Product Key');
      return;
    }

    const alphanumeric = rawInput.replace(/[^A-Za-z0-9]/g, '');
    const isPureNumeric = /^\d+$/.test(rawInput.replace(/-/g, ''));

    // Case 1: 10-Digit Numeric Serial Number
    if (isPureNumeric && alphanumeric.length === 10) {
      const cleanSN = alphanumeric;
      setSnLookupError('');
      setSnLookupResult(null);
      setIsSnBuffering(true);

      if (snBufferTimeoutRef.current) {
        clearTimeout(snBufferTimeoutRef.current);
      }

      snBufferTimeoutRef.current = setTimeout(() => {
        const found = CUSTOMER_DATABASE.find(c => c.serialNumber === cleanSN) ||
          generateRandomCustomer('user@clarivate.com', { serialNumber: cleanSN });
        setSnLookupResult(found);
        setIsSnBuffering(false);
        showToast(`Retrieved details for Serial #${cleanSN}`);
      }, 1000);
      return;
    }

    // Case 2: 25-Digit Alphanumeric Product Key
    if (alphanumeric.length === 25) {
      const chunks = alphanumeric.toUpperCase().match(/.{1,5}/g);
      const formattedKey = chunks ? chunks.join('-') : alphanumeric.toUpperCase();

      setSnLookupError('');
      setSnLookupResult(null);
      setIsSnBuffering(true);

      if (snBufferTimeoutRef.current) {
        clearTimeout(snBufferTimeoutRef.current);
      }

      snBufferTimeoutRef.current = setTimeout(() => {
        const found = CUSTOMER_DATABASE.find(c => {
          if (!c.productKey) return false;
          return c.productKey.replace(/[^A-Za-z0-9]/g, '').toUpperCase() === alphanumeric.toUpperCase();
        }) || generateRandomCustomer('user@clarivate.com', {
          productKey: formattedKey,
          serialNumber: generateSerialForVersion('22')
        });
        setSnLookupResult(found);
        setIsSnBuffering(false);
        showToast(`Retrieved details for Product Key ${formattedKey}`);
      }, 1000);
      return;
    }

    // Validation errors if neither valid 10-digit SN nor valid 25-digit PK
    if (isPureNumeric) {
      setSnLookupError(`Serial Number must be exactly 10 numeric digits. Currently: ${alphanumeric.length} digit${alphanumeric.length === 1 ? '' : 's'}.`);
      showToast(`Serial Number must be 10 digits (currently ${alphanumeric.length})`);
    } else {
      setSnLookupError(`Product Key must be exactly 25 alphanumeric characters. Currently: ${alphanumeric.length} character${alphanumeric.length === 1 ? '' : 's'}.`);
      showToast(`Product Key must be 25 alphanumeric characters (currently ${alphanumeric.length})`);
    }
    setSnLookupResult(null);
  };

  // Handle Dummy Serial Number Generation conforming to 10-digit SN and 25-digit product key rules
  const handleGenerateDummySN = (e) => {
    if (e) e.preventDefault();
    const randomSN = generateSerialForVersion(dummyVersion);
    const randomKey = generate25DigitProductKey();
    const versionName = getEndNoteVersionFromSN(randomSN);

    const result = {
      serialNumber: randomSN,
      productKey: randomKey,
      product: `${versionName} (${dummyProduct})`,
      version: versionName,
      platform: dummyPlatform,
      type: dummyType,
      generatedAt: new Date().toLocaleString()
    };

    setGeneratedDummyResult(result);
    showToast(`Generated Dummy 10-digit Serial #${randomSN} for ${versionName}`);
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



  // If user is not authenticated, show login page
  if (!currentUser) {
    return (
      <div className="wsu-layout" data-theme="light" style={{ backgroundColor: '#F0F0EB' }}>
        <LoginView
          onLogin={handleLogin}
          sessionExpiredMessage={sessionExpiredMsg}
        />
        {toastMessage && (
          <div className="wsu-toast" role="alert">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

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
          onBackClick={revertToWsuPage}
          theme={theme}
          onToggleTheme={toggleTheme}
          onShowToast={showToast}
          userEmail={currentUser}
          sessionTimer={formatTimer(remainingSeconds)}
          onLogout={() => handleLogout(false)}
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

                  {/* Input Field with inline Lookup and Clear / Reset Input buttons */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSNLookupSubmit(e);
                    }}
                    className="wsu-form-box"
                    style={{ maxWidth: '820px', padding: '16px', borderRadius: '6px' }}
                  >
                    <label
                      className="wsu-label"
                      style={{
                        display: 'block',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        color: '#000000',
                        marginBottom: '8px'
                      }}
                    >
                      Input Serial Number or Product Key:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={{ width: '400px', maxWidth: '100%', flexShrink: 0 }}>
                        <SmartInputField
                          value={snLookupInput}
                          onChange={(val) => {
                            // Support 10-digit numeric serial numbers and 25-digit alphanumeric product keys (with optional hyphens)
                            const sanitized = val.replace(/[^A-Za-z0-9\-]/g, '').toUpperCase().slice(0, 29);
                            setSnLookupInput(sanitized);
                            setSnLookupError('');
                            // Do not show results while editing; details only appear after clicking Lookup
                            setSnLookupResult(null);
                          }}
                          onKeyDown={(e) => {
                            // Block any character that is not alphanumeric or hyphen
                            const controlKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                            if (controlKeys.includes(e.key)) return;
                            if (e.ctrlKey || e.metaKey) return;
                            if (!/^[a-zA-Z0-9\-]$/.test(e.key)) {
                              e.preventDefault();
                              return;
                            }
                            if (snLookupInput.length >= 29 && e.target.selectionStart === e.target.selectionEnd) {
                              e.preventDefault();
                            }
                          }}
                          maxLength={29}
                          inputMode="text"
                          fieldLabel="Serial Number or Product Key"
                          errorMessage={snLookupError}
                        />
                      </div>
                      <button
                        type="submit"
                        className="wsu-btn-primary"
                        disabled={isSnBuffering}
                        style={{
                          padding: '5px 16px',
                          height: '30px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: isSnBuffering ? 'wait' : 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          opacity: isSnBuffering ? 0.75 : 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {isSnBuffering ? (
                          <>
                            <span className="wsu-btn-spinner" aria-hidden="true" />
                            <span>Buffering...</span>
                          </>
                        ) : (
                          'Lookup'
                        )}
                      </button>
                      <button
                        type="button"
                        className="wsu-btn-secondary"
                        onClick={() => {
                          if (snBufferTimeoutRef.current) {
                            clearTimeout(snBufferTimeoutRef.current);
                          }
                          setSnLookupInput('');
                          setSnLookupResult(null);
                          setSnLookupError('');
                          setIsSnBuffering(false);
                          showToast('Cleared input field. Ready for Serial Number or Product Key.');
                        }}
                        style={{
                          padding: '5px 14px',
                          height: '30px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                      >
                        Clear / Reset Input
                      </button>
                    </div>
                  </form>
                </div>

                {/* 1 Second Buffering State Indicator */}
                {isSnBuffering && (
                  <div
                    className="wsu-result-box wsu-buffering-card"
                    style={{
                      padding: '30px 24px',
                      borderRadius: '6px',
                      marginBottom: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      textAlign: 'center'
                    }}
                  >
                    <div className="wsu-buffering-spinner" />
                    <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#5E33BF' }}>
                      Buffering Serial Number Details...
                    </div>
                    <div style={{ fontSize: '0.80rem', color: '#000000', opacity: 0.8 }}>
                      Looking up 10-digit serial record <strong>{snLookupInput}</strong> from Registration Services...
                    </div>
                  </div>
                )}

                {/* Serial Number Lookup Result details matching Screenshot 1 */}
                {!isSnBuffering && snLookupResult && (
                  <div className="wsu-result-box" style={{ padding: '24px', borderRadius: '6px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.89rem', color: '#000000', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span><strong>Serial Number:</strong> <span style={{ fontWeight: 400, color: '#000000' }}>{snLookupResult.serialNumber}</span></span>
                      <button
                        type="button"
                        className="wsu-action-btn"
                        onClick={() => handleCopy(snLookupResult.serialNumber, 'Serial Number')}
                        style={{ padding: '2px 8px', fontSize: '0.72rem', height: '20px' }}
                      >
                        Copy
                      </button>
                    </div>

                    <div style={{ fontSize: '0.89rem', color: '#000000', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span><strong>Product Key:</strong> <span style={{ fontWeight: 400, color: '#000000' }}>{snLookupResult.productKey}</span></span>
                      <button
                        type="button"
                        className="wsu-action-btn"
                        onClick={() => handleCopy(snLookupResult.productKey, 'Product Key')}
                        style={{ padding: '2px 8px', fontSize: '0.72rem', height: '20px' }}
                      >
                        Copy
                      </button>
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
              <div className="wsu-card" style={{ width: '100%' }}>
                {/* Search Form Section matching the exact requested pattern: Search Registration on each row, Clear All on top right */}
                <div style={{ marginBottom: '24px' }}>
                  <div className="wsu-card-title">
                    <span>Search the Registration Database:</span>
                    <button
                      type="button"
                      className="wsu-btn-secondary"
                      onClick={() => {
                        if (regFirstName) undoManager.pushCleared('First Name', regFirstName, setRegFirstName, null, 'First Name');
                        if (regLastName) undoManager.pushCleared('Last Name', regLastName, setRegLastName, null, 'Last Name');
                        if (regOrganization) undoManager.pushCleared('Organization', regOrganization, setRegOrganization, null, 'Organization');
                        if (regEmailAddress) undoManager.pushCleared('Email Address', regEmailAddress, setRegEmailAddress, null, 'Email Address');
                        if (regPhoneNumber) undoManager.pushCleared('Phone Number', regPhoneNumber, setRegPhoneNumber, null, 'Phone Number');
                        if (regSerialNumber) undoManager.pushCleared('Serial Number', regSerialNumber, setRegSerialNumber, null, 'Serial Number');
                        setRegFirstName('');
                        setRegLastName('');
                        setRegOrganization('');
                        setRegEmailAddress('');
                        setRegPhoneNumber('');
                        setRegSerialNumber('');
                        setRegSearchQuery('');
                        setHasExecutedRegSearch(false);
                        showToast('Cleared all registration fields. Press Ctrl+Z or U to return them back.');
                      }}
                      style={{
                        padding: '4px 14px',
                        fontSize: '0.82rem',
                        backgroundColor: '#F0F0EB',
                        color: '#000000',
                        border: '1px solid #000000',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontWeight: 600,
                        transition: 'opacity 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      Clear All
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (regEmailAddress.trim() !== '' && !isValidEmail(regEmailAddress.trim())) {
                        setShowInvalidEmailModal(true);
                        return;
                      }
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
                        regSerialNumber
                      ].some(val => val.trim().length > 0);

                      if (!hasAnyInput) {
                        showToast('Please enter a value to search the Registration Database');
                        setHasExecutedRegSearch(false);
                        return;
                      }

                      setHasExecutedRegSearch(true);
                      showToast(`Search Registration executed for ${regEmailAddress || regFirstName || regLastName || regSerialNumber || 'query'}`);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}
                  >
                    {/* 1. First Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ width: '115px', fontWeight: 700, fontSize: '0.84rem', color: '#000000', flexShrink: 0 }}>
                        First Name
                      </label>
                      <div style={{ width: '260px', maxWidth: '100%', flexShrink: 0 }}>
                        <SmartInputField
                          value={regFirstName}
                          onChange={setRegFirstName}
                          fieldLabel="First Name"
                        />
                      </div>
                      <button
                        type="submit"
                        className="wsu-btn-secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          const hasAnyInput = [regFirstName, regLastName, regOrganization, regEmailAddress, regPhoneNumber, regSerialNumber].some(v => v.trim().length > 0);
                          if (!hasAnyInput) {
                            showToast('Please enter a value to search the Registration Database');
                            setHasExecutedRegSearch(false);
                            return;
                          }
                          setHasExecutedRegSearch(true);
                          showToast(`Search Registration executed for First Name: ${regFirstName || 'any'}`);
                        }}
                        style={{
                          marginLeft: '10px',
                          flexShrink: 0,
                          padding: '4px 12px',
                          fontSize: '0.82rem',
                          backgroundColor: '#F0F0EB',
                          color: '#000000',
                          border: '1px solid #000000',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        Search Registration
                      </button>
                    </div>

                    {/* 2. Last Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ width: '115px', fontWeight: 700, fontSize: '0.84rem', color: '#000000', flexShrink: 0 }}>
                        Last Name
                      </label>
                      <div style={{ width: '260px', maxWidth: '100%', flexShrink: 0 }}>
                        <SmartInputField
                          value={regLastName}
                          onChange={setRegLastName}
                          fieldLabel="Last Name"
                        />
                      </div>
                      <button
                        type="submit"
                        className="wsu-btn-secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          const hasAnyInput = [regFirstName, regLastName, regOrganization, regEmailAddress, regPhoneNumber, regSerialNumber].some(v => v.trim().length > 0);
                          if (!hasAnyInput) {
                            showToast('Please enter a value to search the Registration Database');
                            setHasExecutedRegSearch(false);
                            return;
                          }
                          setHasExecutedRegSearch(true);
                          showToast(`Search Registration executed for Last Name: ${regLastName || 'any'}`);
                        }}
                        style={{
                          marginLeft: '10px',
                          flexShrink: 0,
                          padding: '4px 12px',
                          fontSize: '0.82rem',
                          backgroundColor: '#F0F0EB',
                          color: '#000000',
                          border: '1px solid #000000',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        Search Registration
                      </button>
                    </div>

                    {/* 3. Organization */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ width: '115px', fontWeight: 700, fontSize: '0.84rem', color: '#000000', flexShrink: 0 }}>
                        Organization
                      </label>
                      <div style={{ width: '260px', maxWidth: '100%', flexShrink: 0 }}>
                        <SmartInputField
                          value={regOrganization}
                          onChange={setRegOrganization}
                          fieldLabel="Organization"
                        />
                      </div>
                      <button
                        type="submit"
                        className="wsu-btn-secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          const hasAnyInput = [regFirstName, regLastName, regOrganization, regEmailAddress, regPhoneNumber, regSerialNumber].some(v => v.trim().length > 0);
                          if (!hasAnyInput) {
                            showToast('Please enter a value to search the Registration Database');
                            setHasExecutedRegSearch(false);
                            return;
                          }
                          setHasExecutedRegSearch(true);
                          showToast(`Search Registration executed for Organization: ${regOrganization || 'any'}`);
                        }}
                        style={{
                          marginLeft: '10px',
                          flexShrink: 0,
                          padding: '4px 12px',
                          fontSize: '0.82rem',
                          backgroundColor: '#F0F0EB',
                          color: '#000000',
                          border: '1px solid #000000',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        Search Registration
                      </button>
                    </div>

                    {/* 4. Email Address */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ width: '115px', fontWeight: 700, fontSize: '0.84rem', color: '#000000', flexShrink: 0 }}>
                        Email Address
                      </label>
                      <div style={{ width: '260px', maxWidth: '100%', flexShrink: 0 }}>
                        <SmartInputField
                          value={regEmailAddress}
                          onChange={setRegEmailAddress}
                          fieldLabel="Email Address"
                          errorMessage={checkSpaceInEmail(regEmailAddress)}
                        />
                      </div>
                      <button
                        type="submit"
                        className="wsu-btn-secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          if (regEmailAddress.trim() !== '' && !isValidEmail(regEmailAddress.trim())) {
                            setShowInvalidEmailModal(true);
                            return;
                          }
                          const emailErr = checkSpaceInEmail(regEmailAddress);
                          if (emailErr) {
                            showToast(emailErr);
                            return;
                          }
                          const hasAnyInput = [regFirstName, regLastName, regOrganization, regEmailAddress, regPhoneNumber, regSerialNumber].some(v => v.trim().length > 0);
                          if (!hasAnyInput) {
                            showToast('Please enter a value to search the Registration Database');
                            setHasExecutedRegSearch(false);
                            return;
                          }
                          setHasExecutedRegSearch(true);
                          showToast(`Search Registration executed for Email: ${regEmailAddress || 'any'}`);
                        }}
                        style={{
                          marginLeft: '10px',
                          flexShrink: 0,
                          padding: '4px 12px',
                          fontSize: '0.82rem',
                          backgroundColor: '#F0F0EB',
                          color: '#000000',
                          border: '1px solid #000000',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        Search Registration
                      </button>
                    </div>

                    {/* 5. Phone Number */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ width: '115px', fontWeight: 700, fontSize: '0.84rem', color: '#000000', flexShrink: 0 }}>
                        Phone Number
                      </label>
                      <div style={{ width: '260px', maxWidth: '100%', flexShrink: 0 }}>
                        <SmartInputField
                          value={regPhoneNumber}
                          onChange={setRegPhoneNumber}
                          fieldLabel="Phone Number"
                        />
                      </div>
                      <button
                        type="submit"
                        className="wsu-btn-secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          const hasAnyInput = [regFirstName, regLastName, regOrganization, regEmailAddress, regPhoneNumber, regSerialNumber].some(v => v.trim().length > 0);
                          if (!hasAnyInput) {
                            showToast('Please enter a value to search the Registration Database');
                            setHasExecutedRegSearch(false);
                            return;
                          }
                          setHasExecutedRegSearch(true);
                          showToast(`Search Registration executed for Phone Number: ${regPhoneNumber || 'any'}`);
                        }}
                        style={{
                          marginLeft: '10px',
                          flexShrink: 0,
                          padding: '4px 12px',
                          fontSize: '0.82rem',
                          backgroundColor: '#F0F0EB',
                          color: '#000000',
                          border: '1px solid #000000',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        Search Registration
                      </button>
                    </div>

                    {/* 6. Serial Number */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ width: '115px', fontWeight: 700, fontSize: '0.84rem', color: '#000000', flexShrink: 0 }}>
                        Serial Number
                      </label>
                      <div style={{ width: '260px', maxWidth: '100%', flexShrink: 0 }}>
                        <SmartInputField
                          value={regSerialNumber}
                          onChange={setRegSerialNumber}
                          fieldLabel="Serial Number"
                        />
                      </div>
                      <button
                        type="submit"
                        className="wsu-btn-secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          const hasAnyInput = [regFirstName, regLastName, regOrganization, regEmailAddress, regPhoneNumber, regSerialNumber].some(v => v.trim().length > 0);
                          if (!hasAnyInput) {
                            showToast('Please enter a value to search the Registration Database');
                            setHasExecutedRegSearch(false);
                            return;
                          }
                          setHasExecutedRegSearch(true);
                          showToast(`Search Registration executed for Serial Number: ${regSerialNumber || 'any'}`);
                        }}
                        style={{
                          marginLeft: '10px',
                          flexShrink: 0,
                          padding: '4px 12px',
                          fontSize: '0.82rem',
                          backgroundColor: '#F0F0EB',
                          color: '#000000',
                          border: '1px solid #000000',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        Search Registration
                      </button>
                    </div>

                    <div style={{ fontSize: '0.84rem', color: '#000000', marginTop: '6px' }}>
                      Note this may take a few minutes
                    </div>
                  </form>
                </div>

                {/* Results Title & Table (Only displayed after clicking Search Registration) */}
                {hasExecutedRegSearch && (
                  <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                    <div className="wsu-card-title">
                      <span>
                        {filteredRegDatabase.length} Search Result for {regEmailAddress || regSearchQuery || 'all records'}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', flexShrink: 0 }}>
                        <span className="wsu-label">Filter:</span>
                        <div style={{ width: '220px', maxWidth: '100%' }}>
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

                    <div style={{ fontSize: '0.85rem', color: '#000000', marginBottom: '16px', fontWeight: 700 }}>
                      Showing 1 to {filteredRegDatabase.length} of {filteredRegDatabase.length} entries
                    </div>
                  </div>
                )}

                {/* Dotted horizontal divider line matching Screenshot 4 */}
                <div
                  style={{
                    borderTop: '1px dotted #000000',
                    marginTop: '24px',
                    paddingTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.82rem',
                    color: '#000000'
                  }}
                >
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#5E33BF',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: 600,
                      padding: 0
                    }}
                    onClick={() => showToast('Report an Error dialog opened')}
                  >
                    Report an Error
                  </button>
                  <div style={{ fontStyle: 'normal' }}>
                    lookup.pl version 2.3.0. Page generated in 0.0019 seconds
                  </div>
                </div>
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
                        <option value="22">EndNote 2025 (Code: 22)</option>
                        <option value="21">EndNote 21 (Code: 21)</option>
                        <option value="20">EndNote 20 (Code: 20)</option>
                        <option value="19">EndNote X9 (Code: 19)</option>
                        <option value="18">EndNote X8 (Code: 18)</option>
                        <option value="17">EndNote X7 (Code: 17)</option>
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

            {/* SUB VIEW: SITE LICENSES (MATCHING SCREENSHOTS 1 & 2 EXACTLY) */}
            {activeRegSubNav === 'Site Licenses' && (
              <div
                className="wsu-card"
                style={{
                  padding: '24px 20px',
                  border: '1px solid #5E33BF',
                  borderRadius: '6px'
                }}
              >
                <SiteLicensesView
                  theme={theme}
                  onSelectSerial={(sn) => {
                    const found = CUSTOMER_DATABASE.find((c) => c.serialNumber === sn) || {
                      serialNumber: sn,
                      productKey: generate25DigitProductKey(),
                      productSummary: `${getEndNoteVersionFromSN(sn)} Multi-User / Site License Product`,
                      regDeadline: '2028-12-31',
                      latestExpDate: '2029-01-01',
                      webSeats: 'Unlimited',
                      winDownload: `https://download.endnote.com/site/${sn}/EndNoteWinInstaller.zip`,
                      macDownload: `https://download.endnote.com/site/${sn}/EndNoteMacInstaller.dmg`,
                      customerName: 'Site License Customer',
                      email: 'admin@customer.org'
                    };
                    setSelectedSerialDetail(found);
                    setCurrentPage('serial-detail');
                    showToast(`Redirected to license expiration details for ${sn}`);
                  }}
                  onShowToast={showToast}
                />
              </div>
            )}

            {/* SUB VIEW: BLD NUMBER LOOKUP (MATCHING SCREENSHOT 3) */}
            {activeRegSubNav === 'Bld Number Lookup' && (
              <div className="wsu-card" style={{ maxWidth: '900px' }}>
                <h3 style={{ fontSize: '1.09rem', color: '#000000', fontWeight: 700, marginBottom: '16px' }}>
                  Bld Number:
                </h3>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const val = bldNumberInput.trim();
                    if (!val) {
                      showToast('Please enter a Bld Number');
                      return;
                    }
                    setBldLookupResult({
                      bld: val,
                      product: 'EndNote 21.3.0',
                      platform: 'Windows / Macintosh Hybrid',
                      buildDate: '2024-03-12',
                      status: 'Release Production Build'
                    });
                    showToast(`Bld Number Lookup executed for ${val}`);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', maxWidth: '520px' }}
                >
                  <div style={{ flex: 1 }}>
                    <SmartInputField
                      value={bldNumberInput}
                      onChange={setBldNumberInput}
                      fieldLabel="Bld Number"
                    />
                  </div>
                  <button
                    type="submit"
                    className="wsu-btn-secondary"
                    style={{
                      height: '32px',
                      padding: '0 14px',
                      backgroundColor: '#F0F0EB',
                      color: '#000000',
                      border: '1px solid #000000',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: 600,
                      transition: 'opacity 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Lookup
                  </button>
                </form>

                {bldLookupResult && (
                  <div className="wsu-result-box" style={{ padding: '16px', borderRadius: '4px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.88rem', color: '#000000', marginBottom: '6px' }}>
                      <strong>Build Number:</strong> {bldLookupResult.bld}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#000000', marginBottom: '6px' }}>
                      <strong>Mapped Product:</strong> {bldLookupResult.product}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#000000', marginBottom: '6px' }}>
                      <strong>Platform:</strong> {bldLookupResult.platform}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#000000' }}>
                      <strong>Status:</strong> {bldLookupResult.status} (Built: {bldLookupResult.buildDate})
                    </div>
                  </div>
                )}

                <div
                  style={{
                    borderTop: '1px dotted #000000',
                    marginTop: '24px',
                    paddingTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.82rem',
                    color: '#000000'
                  }}
                >
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#5E33BF',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: 600,
                      padding: 0
                    }}
                    onClick={() => showToast('Report an Error dialog opened')}
                  >
                    Report an Error
                  </button>
                  <div style={{ fontStyle: 'normal' }}>
                    lookup.pl version 2.3.0. Page generated in 0.0037 seconds
                  </div>
                </div>
              </div>
            )}

            {/* SUB VIEW: PRODUCT DOWNLOADS (MATCHING SCREENSHOT 1) */}
            {activeRegSubNav === 'Product Downloads' && (
              <div className="wsu-card" style={{ maxWidth: '1100px' }}>
                <h3 style={{ fontSize: '1.09rem', color: '#000000', fontWeight: 700, marginBottom: '14px' }}>
                  Downloads
                </h3>

                <div
                  style={{
                    fontSize: '0.82rem',
                    color: '#000000',
                    lineHeight: 1.5,
                    marginBottom: '20px',
                    backgroundColor: '#F0F0EB',
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #5E33BF'
                  }}
                >
                  <strong>PLEASE NOTE:</strong> EndNote X7 is not compatible with this new Word 2016 version 16.X release If you have EndNote X7, you can select to downgrade your version of Word/Office to the production release of version 15.xx. Make sure the option Automatically Download and Update is not enabled. You can find steps for how to downgrade Word from Microsoft:{' '}
                  <a
                    href="https://support.office.com/en-us/article/How-to-go-back-to-Office-2016-for-Mac-15-xx-versions-from-16-xx-e88ed6c8-6fb4-40a1-9540-529000d3d20f"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#5E33BF', textDecoration: 'underline', wordBreak: 'break-all' }}
                  >
                    https://support.office.com/en-us/article/How-to-go-back-to-Office-2016-for-Mac-15-xx-versions-from-16-xx-e88ed6c8-6fb4-40a1-9540-529000d3d20f
                  </a>
                </div>

                <div className="wsu-table-container" style={{ marginBottom: '24px', maxHeight: '520px', overflowY: 'auto' }}>
                  <table className="wsu-table">
                    <thead>
                      <tr>
                        <th style={{ width: '38%' }}>Product</th>
                        <th>Download</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PRODUCT_DOWNLOADS_LIST.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{item.product}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  color: '#5E33BF',
                                  textDecoration: 'underline',
                                  fontSize: '0.82rem',
                                  wordBreak: 'break-all'
                                }}
                              >
                                {item.url}
                              </a>
                              <button
                                type="button"
                                className="wsu-copy-cell-btn"
                                onClick={() => handleCopy(item.url, `${item.product} URL`)}
                              >
                                Copy
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    borderTop: '1px dotted #000000',
                    marginTop: '24px',
                    paddingTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.82rem',
                    color: '#000000'
                  }}
                >
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#5E33BF',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: 600,
                      padding: 0
                    }}
                    onClick={() => showToast('Error report dialog opened')}
                  >
                    Report an Error
                  </button>
                  <div style={{ fontStyle: 'normal' }}>
                    lookup.pl version 2.3.0. Page generated in 0.0022 seconds
                  </div>
                </div>
              </div>
            )}

            {/* OTHER SUB VIEWS */}
            {!['Serial Number Lookup', 'Registration Database', 'Bld Number Lookup', 'Dummy Serial Number', 'Product Downloads', 'Site Licenses'].includes(activeRegSubNav) && (
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
          userEmail={currentUser}
          sessionTimer={formatTimer(remainingSeconds)}
          onLogout={() => handleLogout(false)}
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
                <button className="wsu-btn-secondary" onClick={revertToWsuPage} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                  Back to WSU Home
                </button>
              </div>

              {/* License Detail Container Box */}
              <div className="wsu-result-box" style={{ padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.95rem', color: '#000000', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span><strong>Serial Number:</strong> <span style={{ fontWeight: 400, color: '#000000' }}>{selectedSerialDetail.serialNumber}</span></span>
                  <button
                    type="button"
                    className="wsu-action-btn"
                    onClick={() => handleCopy(selectedSerialDetail.serialNumber, 'Serial Number')}
                    style={{ padding: '2px 8px', fontSize: '0.72rem', height: '20px' }}
                  >
                    Copy
                  </button>
                </div>

                <div style={{ fontSize: '0.95rem', color: '#000000', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span><strong>Product Key:</strong> <span style={{ fontWeight: 400, color: '#000000' }}>{selectedSerialDetail.productKey}</span></span>
                  <button
                    type="button"
                    className="wsu-action-btn"
                    onClick={() => handleCopy(selectedSerialDetail.productKey, 'Product Key')}
                    style={{ padding: '2px 8px', fontSize: '0.72rem', height: '20px' }}
                  >
                    Copy
                  </button>
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
        userEmail={currentUser}
        sessionTimer={formatTimer(remainingSeconds)}
        onLogout={() => handleLogout(false)}
        centerAction={
          <button
            type="button"
            className="wsu-btn-primary"
            onClick={openSlnPage}
            style={{
              padding: '6px 18px',
              fontSize: '0.82rem',
              fontWeight: 600,
              letterSpacing: '0.2px'
            }}
          >
            SLN Lookup / Reg. Database
          </button>
        }
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
            <a
              href="https://support.myendnoteweb.com/enwservices/supportutility/EndNote%20Web%20Support%20Utility.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={`wsu-sidebar-item ${activeNav === 'Download Manual' ? 'active' : ''}`}
              onClick={() => setActiveNav('Download Manual')}
              style={{ textDecoration: 'none' }}
            >
              <span>Download Manual</span>
            </a>
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
                  <div className="wsu-form-stacked">

                    {/* 1. Email (mail id) */}
                    <SmartInputField
                      label="Email*"
                      value={searchEmail}
                      onChange={setSearchEmail}
                      requiredNote={true}
                      fieldLabel="Email"
                      historyKey="email"
                      errorMessage={checkSpaceInEmail(searchEmail)}
                      afterButton={
                        <button
                          type="submit"
                          className="wsu-btn-primary"
                          onClick={handleCustomerSearch}
                          style={{ minWidth: '145px', flexShrink: 0 }}
                        >
                          Search Customers
                        </button>
                      }
                    />

                    {/* 2. Serial Number (serial no) */}
                    <SmartInputField
                      label="Serial Number:"
                      value={searchSerialNumber}
                      onChange={setSearchSerialNumber}
                      fieldLabel="Serial Number"
                      historyKey="serialNumber"
                      afterButton={
                        <button
                          type="submit"
                          className="wsu-btn-primary"
                          onClick={handleCustomerSearch}
                          style={{ minWidth: '145px', flexShrink: 0 }}
                        >
                          Search Customers
                        </button>
                      }
                    />

                    {/* 3. Steam ID */}
                    <SmartInputField
                      label="Steam ID:"
                      value={searchSteamId}
                      onChange={setSearchSteamId}
                      fieldLabel="Steam ID"
                      historyKey="steamId"
                      afterButton={
                        <button
                          type="submit"
                          className="wsu-btn-primary"
                          onClick={handleCustomerSearch}
                          style={{ minWidth: '145px', flexShrink: 0 }}
                        >
                          Search Customers
                        </button>
                      }
                    />

                    {/* 4. UID */}
                    <SmartInputField
                      label="UID:"
                      value={searchUid}
                      onChange={setSearchUid}
                      fieldLabel="UID"
                      historyKey="uid"
                      afterButton={
                        <button
                          type="submit"
                          className="wsu-btn-primary"
                          onClick={handleCustomerSearch}
                          style={{ minWidth: '145px', flexShrink: 0 }}
                        >
                          Search Customers
                        </button>
                      }
                    />

                    {/* 5. Researcher ID */}
                    <SmartInputField
                      label="Researcher ID:"
                      value={searchResearcherId}
                      onChange={setSearchResearcherId}
                      fieldLabel="Researcher ID"
                      historyKey="researcherId"
                      afterButton={
                        <button
                          type="submit"
                          className="wsu-btn-primary"
                          onClick={handleCustomerSearch}
                          style={{ minWidth: '145px', flexShrink: 0 }}
                        >
                          Search Customers
                        </button>
                      }
                    />

                    {/* 6. Internal ID */}
                    <SmartInputField
                      label="Internal ID:"
                      value={searchInternalId}
                      onChange={setSearchInternalId}
                      fieldLabel="Internal ID"
                      historyKey="internalId"
                      afterButton={
                        <button
                          type="submit"
                          className="wsu-btn-primary"
                          onClick={handleCustomerSearch}
                          style={{ minWidth: '145px', flexShrink: 0 }}
                        >
                          Search Customers
                        </button>
                      }
                    />
                  </div>

                  {/* Radio Match Options */}
                  <div style={{ marginBottom: '16px' }}>
                    <div className="wsu-label" style={{ marginBottom: '6px', fontWeight: 400 }}>Matching:</div>
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
                            <th>State</th>
                            <th>Lib Ver</th>
                            <th>File Storage</th>
                            <th>Last USN</th>
                            <th>Full Sync Before</th>
                            <th>Recov Sync Before</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.map((row, idx) => {
                            // Helper: display 'null' string for empty/null/undefined values
                            const d = (val) => (val === null || val === undefined || val === '' ? 'null' : val);
                            return (
                              <tr key={idx}>
                                <td>
                                  {d(row.first)}
                                  <button className="wsu-copy-cell-btn" onClick={() => handleCopy(d(row.first), 'First Name')}>Copy</button>
                                </td>
                                <td>
                                  {d(row.last)}
                                  <button className="wsu-copy-cell-btn" onClick={() => handleCopy(d(row.last), 'Last Name')}>Copy</button>
                                </td>
                                <td>
                                  <strong>{d(row.email)}</strong>
                                  <button className="wsu-copy-cell-btn" onClick={() => handleCopy(d(row.email), 'Email')}>Copy</button>
                                </td>
                                <td>
                                  {d(row.steamId)}
                                  <button className="wsu-copy-cell-btn" onClick={() => handleCopy(d(row.steamId), 'Steam ID')}>Copy</button>
                                </td>
                                <td>
                                  <code>{d(row.uid)}</code>
                                  <button className="wsu-copy-cell-btn" onClick={() => handleCopy(d(row.uid), 'UID')}>Copy</button>
                                </td>
                                <td>
                                  {d(row.researcherId)}
                                  <button className="wsu-copy-cell-btn" onClick={() => handleCopy(d(row.researcherId), 'Researcher ID')}>Copy</button>
                                </td>
                                <td>
                                  {d(row.internalId)}
                                  <button className="wsu-copy-cell-btn" onClick={() => handleCopy(d(row.internalId), 'Internal ID')}>Copy</button>
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
                                    onClick={() => handleOpenExpirationDates(row)}
                                  >
                                    {d(row.serialNumber)}
                                  </button>
                                  <button className="wsu-copy-cell-btn" onClick={() => handleCopy(d(row.serialNumber), 'Serial Number')}>Copy</button>
                                </td>
                                <td>{d(row.custId)}</td>
                                <td>{d(row.virtCustId)}</td>
                                <td>{d(row.citeDb)}</td>
                                <td>{d(row.state)}</td>
                                <td>{d(row.libVer)}</td>
                                <td>{d(row.fileStorage)}</td>
                                <td>{d(row.lastUsn)}</td>
                                <td>{d(row.fullSyncBefore)}</td>
                                <td>{d(row.recovSyncBefore)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CUSTOMER ACCESS: VIEW 1 - USER ACCESS LOOKUP */}
          {activeNav === 'User Access Lookup' && (
            <div
              className="wsu-card"
              style={{
                padding: '24px 28px',
                border: '1px solid #5E33BF',
                borderRadius: '6px'
              }}
            >
              <UserAccessLookupView theme={theme} onShowToast={showToast} />
            </div>
          )}

          {/* CUSTOMER ACCESS: VIEW 2 - AGGREGATE ACCESS LOOKUP */}
          {activeNav === 'Aggregate Access Lookup' && (
            <div
              className="wsu-card"
              style={{
                padding: '24px 28px',
                border: '1px solid #5E33BF',
                borderRadius: '6px'
              }}
            >
              <AggregateAccessLookupView theme={theme} onShowToast={showToast} />
            </div>
          )}

          {/* CUSTOMER ACCESS: VIEW 3 - USER TEMPORARY CREDENTIALS */}
          {activeNav === 'User Temporary Credentials' && (
            <div
              className="wsu-card"
              style={{
                padding: '24px 28px',
                border: '1px solid #5E33BF',
                borderRadius: '6px'
              }}
            >
              <UserTemporaryCredentialsView theme={theme} onShowToast={showToast} />
            </div>
          )}

          {/* CUSTOMER ACCESS: VIEW 4 - ENDNOTE ONLINE */}
          {activeNav === 'EndNote Online' && (
            <div
              className="wsu-card"
              style={{
                padding: '24px 28px',
                border: '1px solid #5E33BF',
                borderRadius: '6px'
              }}
            >
              <EndNoteOnlineAccessView theme={theme} onShowToast={showToast} />
            </div>
          )}

          {/* CUSTOMER ACCESS: VIEW 5 - ENDNOTE DESKTOP */}
          {activeNav === 'EndNote Desktop' && (
            <div
              className="wsu-card"
              style={{
                padding: '24px 28px',
                border: '1px solid #5E33BF',
                borderRadius: '6px'
              }}
            >
              <EndNoteDesktopBuilderView theme={theme} onShowToast={showToast} />
            </div>
          )}

          {/* VIEW 3: EXPIRATION DATES */}
          {activeNav === 'Expiration Dates' && (() => {
            const cust = expirationCustomer;
            const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            const days = Array.from({length:31},(_,i)=>String(i+1));
            const years = ['2025','2026','2027','2028','2029','2030'];

            // Generate a realistic activation date log for the customer
            const generateActivationDates = (baseDate) => {
              const dates = [];
              const start = new Date('2025-04-22T05:14:04');
              for (let i = 0; i < 80; i++) {
                const d = new Date(start.getTime() + i * 3.6e5 * (Math.random() * 12 + 2));
                const pad = n => String(n).padStart(2,'0');
                dates.push(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.0`);
              }
              return dates.sort().join(', ');
            };

            const activationLog = cust ? generateActivationDates() : '';
            const currentDesktopExp = cust ? (cust.fullSyncBefore || '07/28/2028 23:59:59').replace(/\./,'').replace(/(\d{4})-(\d{2})-(\d{2}) (.*)/,'$2/$3/$1 $4') : '07/28/2028 23:59:59';
            const currentIpExp = cust ? (cust.recovSyncBefore || '10/21/2027 23:59:59').replace(/\./,'').replace(/(\d{4})-(\d{2})-(\d{2}) (.*)/,'$2/$3/$1 $4') : '10/21/2027 23:59:59';

            return (
              <div className="wsu-card">
                <h2 style={{ fontSize: '1.18rem', fontWeight: 400, color: '#000000', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #5E33BF' }}>
                  Desktop and IP Roaming Expiration Dates
                </h2>

                {/* Email lookup row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                  <label className="wsu-label" style={{ whiteSpace: 'nowrap' }}>Customer email:</label>
                  <div className="wsu-input-wrapper" style={{ width: '280px' }}>
                    <input
                      type="text"
                      className="wsu-input"
                      value={expirationEmail}
                      onChange={e => setExpirationEmail(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <button
                    className="wsu-btn-primary"
                    style={{ fontSize: '0.79rem', padding: '6px 14px' }}
                    onClick={() => {
                      if (expirationEmail.trim() !== '' && !isValidEmail(expirationEmail.trim())) {
                        setShowInvalidEmailModal(true);
                        return;
                      }
                      const found = CUSTOMER_DATABASE.find(c => c.email.toLowerCase() === expirationEmail.trim().toLowerCase());
                      if (found) {
                        setExpirationCustomer(found);
                        showToast(`Loaded expiration dates for ${found.email}`);
                      } else {
                        showToast('No exact match found — showing demo data');
                      }
                    }}
                  >
                    Get Expiration Dates
                  </button>
                </div>

                {/* Desktop Expiration Section */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 400, color: '#000000', marginBottom: '16px', borderBottom: '1px solid #5E33BF', paddingBottom: '6px' }}>
                    Desktop Expiration:
                  </h3>

                  <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.82rem' }}>
                    <tbody>
                      <tr style={{ verticalAlign: 'top' }}>
                        <td style={{ fontWeight: 700, color: '#000000', padding: '4px 16px 4px 0', whiteSpace: 'nowrap', width: '200px' }}>Desktop Serial Number:</td>
                        <td style={{ color: '#000000', padding: '4px 0' }}>{cust ? cust.serialNumber : 'null'}</td>
                      </tr>
                      <tr style={{ verticalAlign: 'top' }}>
                        <td style={{ fontWeight: 700, color: '#000000', padding: '4px 16px 4px 0', whiteSpace: 'nowrap' }}>Desktop Version:</td>
                        <td style={{ color: '#000000', padding: '4px 0' }}>EndNote 22 Hybrid Platform Multi-User</td>
                      </tr>
                      <tr style={{ verticalAlign: 'top' }}>
                        <td style={{ fontWeight: 700, color: '#000000', padding: '4px 16px 4px 0', whiteSpace: 'nowrap' }}>Desktop Activation Date:</td>
                        <td style={{ color: '#000000', padding: '4px 0', wordBreak: 'break-all', lineHeight: 1.6 }}>
                          {activationLog}
                        </td>
                      </tr>
                      <tr style={{ verticalAlign: 'top' }}>
                        <td style={{ fontWeight: 700, color: '#000000', padding: '8px 16px 4px 0', whiteSpace: 'nowrap' }}>Current Desktop Expiration:</td>
                        <td style={{ color: '#000000', padding: '8px 0 4px 0', fontWeight: 400 }}>{currentDesktopExp}</td>
                      </tr>
                      <tr style={{ verticalAlign: 'top' }}>
                        <td style={{ fontWeight: 700, color: '#000000', padding: '8px 16px 4px 0', whiteSpace: 'nowrap' }}>New Desktop Expiration:</td>
                        <td style={{ padding: '8px 0 4px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <select className="wsu-select" value={newDesktopMonth} onChange={e => setNewDesktopMonth(e.target.value)} style={{ fontSize: '0.79rem' }}>
                              {months.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <select className="wsu-select" value={newDesktopDay} onChange={e => setNewDesktopDay(e.target.value)} style={{ fontSize: '0.79rem', width: '60px' }}>
                              {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select className="wsu-select" value={newDesktopYear} onChange={e => setNewDesktopYear(e.target.value)} style={{ fontSize: '0.79rem', width: '72px' }}>
                              {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <button
                              className="wsu-btn-primary"
                              style={{ fontSize: '0.79rem', padding: '5px 12px' }}
                              onClick={() => showToast(`Desktop expiration set to ${newDesktopMonth} ${newDesktopDay}, ${newDesktopYear}`)}
                            >
                              Set Desktop Expiration
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* IP Roaming Expiration Section */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 400, color: '#000000', marginBottom: '16px', borderBottom: '1px solid #5E33BF', paddingBottom: '6px' }}>
                    IP Roaming Expiration:
                  </h3>

                  <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.82rem' }}>
                    <tbody>
                      <tr style={{ verticalAlign: 'top' }}>
                        <td style={{ fontWeight: 700, color: '#000000', padding: '4px 16px 4px 0', whiteSpace: 'nowrap', width: '220px' }}>Current IP Roaming Expiration:</td>
                        <td style={{ color: '#000000', padding: '4px 0' }}>{currentIpExp}</td>
                      </tr>
                      <tr style={{ verticalAlign: 'top' }}>
                        <td style={{ fontWeight: 700, color: '#000000', padding: '8px 16px 4px 0', whiteSpace: 'nowrap' }}>Next IP Roaming Expiration:</td>
                        <td style={{ padding: '8px 0 4px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <select className="wsu-select" value={newIpMonth} onChange={e => setNewIpMonth(e.target.value)} style={{ fontSize: '0.79rem' }}>
                              {months.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <select className="wsu-select" value={newIpDay} onChange={e => setNewIpDay(e.target.value)} style={{ fontSize: '0.79rem', width: '60px' }}>
                              {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select className="wsu-select" value={newIpYear} onChange={e => setNewIpYear(e.target.value)} style={{ fontSize: '0.79rem', width: '72px' }}>
                              {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <button
                              className="wsu-btn-primary"
                              style={{ fontSize: '0.79rem', padding: '5px 12px' }}
                              onClick={() => showToast(`IP Roaming expiration set to ${newIpMonth} ${newIpDay}, ${newIpYear}`)}
                            >
                              Set IP Roaming Expiration
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div style={{ borderTop: '1px solid #5E33BF', paddingTop: '12px', marginTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.79rem' }}>
                  <button style={{ background: 'none', border: 'none', color: '#5E33BF', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }} onClick={() => showToast('Error report dialog opened')}>Report an Error</button>
                  <div style={{ fontStyle: 'italic', fontWeight: 600 }}>lookup.pl version 2.3.0. Page generated in 0.2200 seconds</div>
                </div>
              </div>
            );
          })()}

          {/* VIEW 3.5: CUSTOMER ASSOCIATIONS */}
          {activeNav === 'Customer Associations' && (
            <div className="wsu-card">
              <h2 style={{ fontSize: '1.18rem', fontWeight: 400, color: '#000000', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #5E33BF' }}>
                Customer Associations
              </h2>

              {/* Email lookup row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
                <label className="wsu-label" style={{ whiteSpace: 'nowrap' }}>Customer email:</label>
                <div className="wsu-input-wrapper" style={{ width: '300px' }}>
                  <input
                    type="text"
                    className="wsu-input"
                    value={associationsEmail}
                    onChange={e => setAssociationsEmail(e.target.value)}
                    autoComplete="off"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = associationsEmail.trim();
                        if (val !== '' && !isValidEmail(val)) {
                          setShowInvalidEmailModal(true);
                          return;
                        }
                        const key = val.toLowerCase();
                        const rows = CUSTOMER_ASSOCIATIONS[key] || [];
                        setAssociationsRows(rows);
                        setAssocChecked({});
                        setAssocAllChecked(false);
                        showToast(rows.length > 0 ? `Found ${rows.length} associations` : 'No associations found');
                      }
                    }}
                  />
                </div>
                <button
                  className="wsu-btn-primary"
                  style={{ fontSize: '0.79rem', padding: '6px 14px' }}
                  onClick={() => {
                    const val = associationsEmail.trim();
                    if (val !== '' && !isValidEmail(val)) {
                      setShowInvalidEmailModal(true);
                      return;
                    }
                    const key = val.toLowerCase();
                    const rows = CUSTOMER_ASSOCIATIONS[key] || [];
                    setAssociationsRows(rows);
                    setAssocChecked({});
                    setAssocAllChecked(false);
                    showToast(rows.length > 0 ? `Found ${rows.length} associations` : 'No associations found for this email');
                  }}
                >
                  Get Customer Associations
                </button>
              </div>

              {/* Results section */}
              {associationsRows !== null && (
                <>
                  {associationsRows.length > 0 ? (
                    <>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#000000', marginBottom: '14px' }}>
                        {associationsEmail.trim()} is a member of the following groups:
                      </p>

                      {/* Associations Table */}
                      <div className="wsu-table-container" style={{ marginBottom: '14px' }}>
                        <table className="wsu-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>External CID</th>
                              <th>Group ID</th>
                              <th>App ID</th>
                              <th>Market Test</th>
                              <th style={{ width: '36px', textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={assocAllChecked}
                                  onChange={e => {
                                    const checked = e.target.checked;
                                    setAssocAllChecked(checked);
                                    const newChecked = {};
                                    associationsRows.forEach((_, i) => { newChecked[i] = checked; });
                                    setAssocChecked(newChecked);
                                  }}
                                  style={{ accentColor: '#5E33BF', cursor: 'pointer' }}
                                />
                              </th>
                              <th style={{ width: '36px', textAlign: 'center', fontSize: '0.7rem' }}>All</th>
                            </tr>
                          </thead>
                          <tbody>
                            {associationsRows.map((row, i) => (
                              <tr key={i}>
                                <td style={{ fontWeight: 400 }}>{row.name}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.74rem' }}>{row.externalCid}</td>
                                <td>{row.groupId}</td>
                                <td>{row.appId}</td>
                                <td>{row.marketTest || ''}</td>
                                <td style={{ textAlign: 'center' }}>
                                  <input
                                    type="checkbox"
                                    checked={!!assocChecked[i]}
                                    onChange={e => {
                                      const next = { ...assocChecked, [i]: e.target.checked };
                                      setAssocChecked(next);
                                      setAssocAllChecked(associationsRows.every((_, idx) => next[idx]));
                                    }}
                                    style={{ accentColor: '#5E33BF', cursor: 'pointer' }}
                                  />
                                </td>
                                <td></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Remove WOK groups button */}
                      <div style={{ marginBottom: '20px' }}>
                        <button
                          className="wsu-btn-secondary"
                          style={{ fontSize: '0.79rem', padding: '5px 12px', opacity: Object.values(assocChecked).some(v => v) ? 1 : 0.55 }}
                          onClick={() => {
                            const selectedWokRows = associationsRows.filter((r, i) => assocChecked[i] && r.appId === 'WOK');
                            if (selectedWokRows.length === 0) {
                              showToast('No WOK groups selected');
                              return;
                            }
                            showToast(`Removed ${selectedWokRows.length} WOK group(s)`);
                          }}
                        >
                          Remove the selected WOK groups
                        </button>
                      </div>
                    </>
                  ) : (
                    <p style={{ fontSize: '0.9rem', color: '#5E33BF', fontStyle: 'italic', marginBottom: '20px' }}>
                      No group associations found for <strong>{associationsEmail.trim()}</strong>.
                    </p>
                  )}

                  {/* Add Association row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <select
                      className="wsu-select"
                      value={assocAddUniversity}
                      onChange={e => setAssocAddUniversity(e.target.value)}
                      style={{ fontSize: '0.79rem', minWidth: '320px' }}
                    >
                      {UNIVERSITY_LIST.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <button
                      className="wsu-btn-primary"
                      style={{ fontSize: '0.79rem', padding: '5px 12px' }}
                      onClick={() => showToast(`Added association: ${assocAddUniversity}`)}
                    >
                      Add Association
                    </button>
                  </div>
                </>
              )}

              {/* Footer */}
              <div style={{ borderTop: '1px solid #5E33BF', paddingTop: '12px', marginTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.79rem' }}>
                <button style={{ background: 'none', border: 'none', color: '#5E33BF', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }} onClick={() => showToast('Error report dialog opened')}>Report an Error</button>
                <div style={{ fontStyle: 'italic', fontWeight: 600 }}>lookup.pl version 2.3.0. Page generated in 0.1800 seconds</div>
              </div>
            </div>
          )}

          {/* VIEW: CUSTOMER PASSWORD (MATCHING SCREENSHOT EXACTLY) */}
          {activeNav === 'Customer Password' && (
            <div
              className="wsu-card"
              style={{
                padding: '24px 28px',
                border: '1px solid #5E33BF',
                borderRadius: '6px'
              }}
            >
              <CustomerPasswordView theme={theme} onShowToast={showToast} />
            </div>
          )}

          {/* VIEW: GROUPS SHARING (MATCHING SCREENSHOT 1) */}
          {activeNav === 'Groups Sharing' && (
            <div
              className="wsu-card"
              style={{
                padding: '24px 28px',
                border: '1px solid #5E33BF',
                borderRadius: '6px'
              }}
            >
              <GroupsSharingView theme={theme} onShowToast={showToast} />
            </div>
          )}

          {/* VIEW: ALTER REFERENCE DATA (MATCHING SCREENSHOT 2) */}
          {activeNav === 'Alter Reference Data' && (
            <div
              className="wsu-card"
              style={{
                padding: '24px 28px',
                border: '1px solid #5E33BF',
                borderRadius: '6px'
              }}
            >
              <AlterReferenceDataView theme={theme} onShowToast={showToast} />
            </div>
          )}

          {/* VIEW: SERIAL NUMBER LOOKUP UNDER CUSTOMERS (MATCHING SCREENSHOT 3) */}
          {activeNav === 'Serial Number Lookup' && (
            <div
              className="wsu-card"
              style={{
                padding: '24px 28px',
                border: '1px solid #5E33BF',
                borderRadius: '6px'
              }}
            >
              <SerialNumberHistoryLookupView
                theme={theme}
                onSelectSerial={(sn) => {
                  const found = CUSTOMER_DATABASE.find((c) => c.serialNumber === sn) || {
                    serialNumber: sn,
                    productKey: generate25DigitProductKey(),
                    productSummary: `${getEndNoteVersionFromSN(sn)} Multi-User / Site License Product`,
                    regDeadline: '2028-12-31',
                    latestExpDate: '2029-01-01',
                    webSeats: 'Unlimited',
                    winDownload: `https://download.endnote.com/site/${sn}/EndNoteWinInstaller.zip`,
                    macDownload: `https://download.endnote.com/site/${sn}/EndNoteMacInstaller.dmg`,
                    customerName: 'Customer Associated with ' + sn,
                    email: 'customer@organization.com'
                  };
                  setSelectedSerialDetail(found);
                  setCurrentPage('serial-detail');
                  showToast(`Redirected to license expiration details for ${sn}`);
                }}
                onShowToast={showToast}
              />
            </div>
          )}

          {/* VIEW: DOWNLOAD MANUAL */}
          {activeNav === 'Download Manual' && (
            <div
              className="wsu-card"
              style={{
                padding: '24px 28px',
                border: '1px solid #5E33BF',
                borderRadius: '6px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  borderBottom: '1px solid #5E33BF',
                  paddingBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: theme === 'dark' ? '#FFFFFF' : '#000000'
                    }}
                  >
                    EndNote Web Support Utility Manual
                  </h2>
                  <p
                    style={{
                      margin: '4px 0 0 0',
                      fontSize: '0.85rem',
                      color: theme === 'dark' ? '#FFFFFF' : '#000000'
                    }}
                  >
                    Documentation &amp; User Reference Guide
                  </p>
                </div>
                <a
                  href="https://support.myendnoteweb.com/enwservices/supportutility/EndNote%20Web%20Support%20Utility.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wsu-btn-primary"
                  style={{
                    backgroundColor: '#5E33BF',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  Open / Download PDF Manual ↗
                </a>
              </div>

              <div
                style={{
                  marginBottom: '16px',
                  fontSize: '0.86rem',
                  lineHeight: '1.5',
                  color: theme === 'dark' ? '#FFFFFF' : '#000000'
                }}
              >
                Direct Link:{' '}
                <a
                  href="https://support.myendnoteweb.com/enwservices/supportutility/EndNote%20Web%20Support%20Utility.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#5E33BF',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    wordBreak: 'break-all'
                  }}
                >
                  https://support.myendnoteweb.com/enwservices/supportutility/EndNote%20Web%20Support%20Utility.pdf
                </a>
              </div>

              <div
                style={{
                  border: '1px solid #5E33BF',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  height: 'calc(100vh - 310px)',
                  minHeight: '520px',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <iframe
                  src="https://support.myendnoteweb.com/enwservices/supportutility/EndNote%20Web%20Support%20Utility.pdf"
                  title="EndNote Web Support Utility Manual PDF"
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                />
              </div>
            </div>
          )}

          {/* VIEW 4: OTHER NAV VIEWS */}
          {![
            'Search Customers',
            'User Access Lookup',
            'Aggregate Access Lookup',
            'User Temporary Credentials',
            'EndNote Online',
            'EndNote Desktop',
            'Expiration Dates',
            'Customer Associations',
            'Customer Password',
            'Groups Sharing',
            'Alter Reference Data',
            'Serial Number Lookup',
            'Download Manual'
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

      {/* Invalid email popup modal with OK button */}
      <InvalidEmailModal
        isOpen={showInvalidEmailModal}
        onClose={() => setShowInvalidEmailModal(false)}
        theme={theme}
      />
    </div>
  );
}
