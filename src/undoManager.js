/**
 * Centralized Undo & Redo Manager for Clarivate Web Support Utility
 * Handles keyboard-based Undo & Redo:
 * - Undo: Ctrl+Z / Cmd+Z, Ctrl+U / Cmd+U, and 'U' outside inputs
 * - Redo: Ctrl+Shift+Z / Cmd+Shift+Z, Ctrl+Y / Cmd+Y
 */

class UndoManager {
  constructor() {
    this.historyStack = []; // [ { id, value, setter, inputEl, label, timestamp } ]
    this.redoStack = []; // [ { id, value, setter, inputEl, label, timestamp } ]
    this.fieldHistories = {}; // { [id]: string[] }
    this.fieldRedos = {}; // { [id]: string[] }
    this.subscribers = new Set();
    this.showToastFn = null;
    this.isListening = false;
  }

  setToastHandler(fn) {
    this.showToastFn = fn;
  }

  showToast(msg) {
    if (this.showToastFn) {
      this.showToastFn(msg);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error(err);
      }
    });
  }

  /**
   * Record a cleared field value
   */
  pushCleared(id, value, setter, inputEl = null, label = id) {
    if (value === undefined || value === null) return;
    const str = String(value);
    if (!str.trim()) return;

    if (!this.fieldHistories[id]) {
      this.fieldHistories[id] = [];
    }
    this.fieldHistories[id].push(str);

    this.historyStack.push({
      id,
      value: str,
      setter,
      inputEl,
      label
    });

    // Clear redo history when a new action occurs
    this.redoStack = [];
    this.fieldRedos[id] = [];

    this.notify();
    this.showToast(`Cleared ${label}. Press Ctrl+Z or U to return it back.`);
  }

  /**
   * Check if undo is available
   */
  canUndo(id) {
    if (id) {
      return (this.fieldHistories[id] || []).length > 0;
    }
    return this.historyStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(id) {
    if (id) {
      return (this.fieldRedos[id] || []).length > 0;
    }
    return this.redoStack.length > 0;
  }

  /**
   * Undo for a specific field
   */
  undoField(id) {
    for (let i = this.historyStack.length - 1; i >= 0; i--) {
      if (this.historyStack[i].id === id) {
        const item = this.historyStack.splice(i, 1)[0];
        if (this.fieldHistories[id] && this.fieldHistories[id].length > 0) {
          this.fieldHistories[id].pop();
        }

        // Push to redo stack
        if (!this.fieldRedos[id]) this.fieldRedos[id] = [];
        this.fieldRedos[id].push(item.value);
        this.redoStack.push(item);

        if (item.setter) {
          item.setter(item.value);
        }
        if (item.inputEl && typeof item.inputEl.focus === 'function') {
          setTimeout(() => {
            try {
              item.inputEl.focus();
              if (typeof item.inputEl.select === 'function') {
                item.inputEl.select();
              }
            } catch (_) {}
          }, 20);
        }
        this.notify();
        this.showToast(`Returned back ${item.label}: ${item.value}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Undo the most recently cleared input
   */
  undoLast() {
    if (this.historyStack.length === 0) {
      this.showToast('No cleared input to return back.');
      return false;
    }

    const item = this.historyStack.pop();
    if (this.fieldHistories[item.id] && this.fieldHistories[item.id].length > 0) {
      this.fieldHistories[item.id].pop();
    }

    // Push to redo stack
    if (!this.fieldRedos[item.id]) this.fieldRedos[item.id] = [];
    this.fieldRedos[item.id].push(item.value);
    this.redoStack.push(item);

    if (item.setter) {
      item.setter(item.value);
    }
    if (item.inputEl && typeof item.inputEl.focus === 'function') {
      setTimeout(() => {
        try {
          item.inputEl.focus();
          if (typeof item.inputEl.select === 'function') {
            item.inputEl.select();
          }
        } catch (_) {}
      }, 20);
    }
    this.notify();
    this.showToast(`Returned back ${item.label}: ${item.value}`);
    return true;
  }

  /**
   * Redo for a specific field
   */
  redoField(id) {
    for (let i = this.redoStack.length - 1; i >= 0; i--) {
      if (this.redoStack[i].id === id) {
        const item = this.redoStack.splice(i, 1)[0];
        if (this.fieldRedos[id] && this.fieldRedos[id].length > 0) {
          this.fieldRedos[id].pop();
        }

        // Put back in historyStack
        if (!this.fieldHistories[id]) this.fieldHistories[id] = [];
        this.fieldHistories[id].push(item.value);
        this.historyStack.push(item);

        // Clearing field again
        if (item.setter) {
          item.setter('');
        }
        if (item.inputEl && typeof item.inputEl.focus === 'function') {
          setTimeout(() => {
            try {
              item.inputEl.focus();
            } catch (_) {}
          }, 20);
        }
        this.notify();
        this.showToast(`Redid clear for ${item.label}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Redo the most recently undone input
   */
  redoLast() {
    if (this.redoStack.length === 0) {
      this.showToast('Nothing to redo.');
      return false;
    }

    const item = this.redoStack.pop();
    if (this.fieldRedos[item.id] && this.fieldRedos[item.id].length > 0) {
      this.fieldRedos[item.id].pop();
    }

    // Put back in historyStack
    if (!this.fieldHistories[item.id]) this.fieldHistories[item.id] = [];
    this.fieldHistories[item.id].push(item.value);
    this.historyStack.push(item);

    // Re-clearing field
    if (item.setter) {
      item.setter('');
    }
    if (item.inputEl && typeof item.inputEl.focus === 'function') {
      setTimeout(() => {
        try {
          item.inputEl.focus();
        } catch (_) {}
      }, 20);
    }
    this.notify();
    this.showToast(`Redid clear for ${item.label}`);
    return true;
  }

  /**
   * Initialize global window keydown listeners
   */
  initGlobalListeners() {
    if (typeof window === 'undefined' || this.isListening) return;
    this.isListening = true;

    window.addEventListener(
      'keydown',
      (e) => {
        const isCtrlOrMeta = e.ctrlKey || e.metaKey;
        const key = e.key ? e.key.toLowerCase() : '';
        const isShift = e.shiftKey;
        const isTargetInput =
          e.target &&
          (e.target.tagName === 'INPUT' ||
            e.target.tagName === 'TEXTAREA' ||
            e.target.tagName === 'SELECT');

        // REDO: Ctrl + Shift + Z / Cmd + Shift + Z, Ctrl + Shift + U / Cmd + Shift + U, or Ctrl + Y / Cmd + Y
        if ((isCtrlOrMeta && isShift && (key === 'z' || key === 'u')) || (isCtrlOrMeta && key === 'y')) {
          const targetField =
            e.target?.dataset?.field || e.target?.name || e.target?.id;

          if (isTargetInput && targetField && this.canRedo(targetField)) {
            e.preventDefault();
            this.redoField(targetField);
            return;
          } else if (this.canRedo()) {
            e.preventDefault();
            this.redoLast();
            return;
          }
        }

        // UNDO: Ctrl + Z / Cmd + Z or Ctrl + U / Cmd + U
        if (isCtrlOrMeta && !isShift && (key === 'z' || key === 'u')) {
          const targetField =
            e.target?.dataset?.field || e.target?.name || e.target?.id;

          if (isTargetInput && targetField && this.canUndo(targetField)) {
            e.preventDefault();
            this.undoField(targetField);
          } else if (!isTargetInput || e.target?.value === '' || this.canUndo()) {
            if (this.historyStack.length > 0) {
              e.preventDefault();
              this.undoLast();
            }
          }
        }
        // Standalone 'U' or 'u' key when not focused in an input
        else if (!isTargetInput && key === 'u' && !e.altKey && !e.ctrlKey && !e.metaKey) {
          if (this.historyStack.length > 0) {
            e.preventDefault();
            this.undoLast();
          }
        }
      },
      true // capture phase
    );
  }
}

export const undoManager = new UndoManager();
undoManager.initGlobalListeners();
