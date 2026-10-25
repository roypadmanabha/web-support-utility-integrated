import { useRef, useEffect, useState, useCallback } from 'react';
import { undoManager } from './undoManager';

/**
 * Hook to manage undo history for fields in views, backed by the centralized undoManager.
 * Supports:
 * - Ctrl + Z / Cmd + Z
 * - Ctrl + U / Cmd + U
 * - U key outside inputs
 * - Inline ↩ Return buttons
 */
export function useUndoableInputs(fieldSetters = {}, onShowToast = null) {
  const inputRefs = useRef({});
  const [, setTick] = useState(0);

  // Connect toast handler to undoManager
  useEffect(() => {
    if (onShowToast) {
      undoManager.setToastHandler(onShowToast);
    }
  }, [onShowToast]);

  // Subscribe to undoManager updates to update canUndo states in UI
  useEffect(() => {
    const unsubscribe = undoManager.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  // Register an input element ref for re-focusing
  const registerRef = useCallback(
    (key) => (el) => {
      if (el) {
        inputRefs.current[key] = el;
      }
    },
    []
  );

  // Clear a field and record it in undo history
  const clearField = useCallback(
    (key, currentValue, label = key) => {
      const inputEl = inputRefs.current[key] || null;
      const setter = fieldSetters[key];
      undoManager.pushCleared(key, currentValue, setter, inputEl, label);
      if (setter) {
        setter('');
      }
    },
    [fieldSetters]
  );

  // Undo a specific field
  const undoField = useCallback((key) => {
    return undoManager.undoField(key);
  }, []);

  // Undo the most recently cleared field
  const undoLast = useCallback(() => {
    return undoManager.undoLast();
  }, []);

  // Redo a specific field
  const redoField = useCallback((key) => {
    return undoManager.redoField(key);
  }, []);

  // Redo the most recently undone field
  const redoLast = useCallback(() => {
    return undoManager.redoLast();
  }, []);

  // Check if a field or any field can be undone
  const canUndo = useCallback((key) => {
    return undoManager.canUndo(key);
  }, []);

  // Check if a field or any field can be redone
  const canRedo = useCallback((key) => {
    return undoManager.canRedo(key);
  }, []);

  return {
    clearField,
    undoField,
    undoLast,
    redoField,
    redoLast,
    canUndo,
    canRedo,
    registerRef
  };
}
