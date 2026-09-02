// hooks/useUndoableState.ts
import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import storageService from '../common/services/storageService.ts';

const MAX_HISTORY_SIZE = 50;

interface HistoryState<T> {
  history: T[];
  currentIndex: number;
}

export function useUndoableState<T>(
  key: string,
  initialValue: T
) {
  const historyStateKey = `${key}-history-state`;

  const initializer = (): HistoryState<T> => {
    const storedHistory = storageService.getItem<HistoryState<T>>(historyStateKey);

    if (
      storedHistory &&
      Array.isArray(storedHistory.history) &&
      storedHistory.history.length > 0 &&
      typeof storedHistory.currentIndex === 'number' &&
      storedHistory.currentIndex >= 0 &&
      storedHistory.currentIndex < storedHistory.history.length
    ) {
      return storedHistory;
    }

    const oldState = storageService.getItem<T>(key);
    if (oldState !== null) {
      return { history: [oldState], currentIndex: 0 };
    }

    return { history: [initialValue], currentIndex: 0 };
  };

  const [state, setStateInternal] = useLocalStorage<HistoryState<T>>(historyStateKey, initializer);

  const { history, currentIndex } = state;
  const currentState = history[currentIndex];

  const setState = useCallback((value: T | ((val: T) => T)) => {
    setStateInternal(prevState => {
      const { history: prevHistory, currentIndex: prevIndex } = prevState;
      const lastState = prevHistory[prevIndex];
      const newState = value instanceof Function ? value(lastState) : value;

      if (JSON.stringify(newState) === JSON.stringify(lastState)) {
        return prevState;
      }

      const newHistory = [...prevHistory.slice(0, prevIndex + 1), newState].slice(-MAX_HISTORY_SIZE);

      return {
        history: newHistory,
        currentIndex: newHistory.length - 1,
      };
    });
  }, [setStateInternal]);

  const setStateWithoutHistory = useCallback((value: T | ((val: T) => T)) => {
    setStateInternal(prevState => {
      const { history: prevHistory, currentIndex: prevIndex } = prevState;
      const lastState = prevHistory[prevIndex];
      const newState = value instanceof Function ? value(lastState) : value;

      if (JSON.stringify(newState) === JSON.stringify(lastState)) {
        return prevState;
      }
      
      const historyWithReplacement = [...prevHistory];
      historyWithReplacement[prevIndex] = newState;

      // Truncate any 'redo' states
      const newHistory = historyWithReplacement.slice(0, prevIndex + 1);

      return {
        history: newHistory,
        currentIndex: newHistory.length - 1,
      };
    });
  }, [setStateInternal]);

  const undo = useCallback(() => {
    setStateInternal(prevState => {
      if (prevState.currentIndex <= 0) {
        return prevState;
      }
      return { ...prevState, currentIndex: prevState.currentIndex - 1 };
    });
  }, [setStateInternal]);

  const redo = useCallback(() => {
    setStateInternal(prevState => {
      if (prevState.currentIndex >= prevState.history.length - 1) {
        return prevState;
      }
      return { ...prevState, currentIndex: prevState.currentIndex + 1 };
    });
  }, [setStateInternal]);

  useEffect(() => {
    storageService.setItem(key, currentState);
  }, [currentState, key]);

  return { 
    state: currentState, 
    setState, 
    setStateWithoutHistory,
    undo, 
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1
  };
}