const FILE_PATH = 'hooks/useUndoableState.ts';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import storageService from '../common/services/storageService.ts';
import {
  initializeUndoableState,
  type HistoryState,
} from './undoableStorageHelpers.ts';

const MAX_HISTORY_SIZE = 50;

export function useUndoableState<T>(
  key: string,
  initialValue: T,
  onStorageError?: (message: string) => void
) {
  const historyStateKey = `${key}-history-state`;
  const isPersistenceBlockedRef = useRef(false);
  const startupErrorRef = useRef<string | null>(null);

  const [state, setStateInternal] = useState<HistoryState<T>>(
    () => {
      const init = initializeUndoableState(
        key,
        historyStateKey,
        initialValue
      );
      isPersistenceBlockedRef.current = init.persistenceBlocked;
      startupErrorRef.current = init.startupError;
      return init.initialState;
    }
  );

  const latestHistoryRef = useRef<HistoryState<T>>(state);
  const onStorageErrorRef = useRef(onStorageError);
  onStorageErrorRef.current = onStorageError;

  useEffect(() => {
    if (startupErrorRef.current) {
      const msg = startupErrorRef.current;
      startupErrorRef.current = null;
      onStorageErrorRef.current?.(msg);
      return;
    }
    if (
      !isPersistenceBlockedRef.current &&
      storageService.getRawItem(historyStateKey) !== null &&
      storageService.getItem<T>(key) !== null
    ) {
      storageService.removeItem(historyStateKey);
    }
  }, [key, historyStateKey]);

  const persistCurrentState = useCallback(
    (nextCurrentState: T) => {
      if (isPersistenceBlockedRef.current) {
        onStorageErrorRef.current?.(
          `Cannot save changes because existing raw data in "${key}" ` +
            'is corrupted and protected from overwrite.'
        );
        return;
      }
      if (!storageService.setItem(key, nextCurrentState)) {
        onStorageErrorRef.current?.(
          `Failed to save your list to browser storage ("${key}"). ` +
            'Storage quota may be full; back up your list now.'
        );
      }
    },
    [key]
  );

  const { history, currentIndex } = state;
  const currentState = history[currentIndex];

  const setState = useCallback(
    (value: T | ((val: T) => T)) => {
      const prevState = latestHistoryRef.current;
      const { history: prevHistory, currentIndex: prevIndex } =
        prevState;
      const lastState = prevHistory[prevIndex];
      const newState =
        value instanceof Function ? value(lastState) : value;

      if (
        JSON.stringify(newState) === JSON.stringify(lastState)
      ) {
        return;
      }

      const newHistory = [
        ...prevHistory.slice(0, prevIndex + 1),
        newState,
      ].slice(-MAX_HISTORY_SIZE);

      const next: HistoryState<T> = {
        history: newHistory,
        currentIndex: newHistory.length - 1,
      };
      latestHistoryRef.current = next;
      setStateInternal(next);
      persistCurrentState(newState);
    },
    [persistCurrentState]
  );

  const setStateWithoutHistory = useCallback(
    (value: T | ((val: T) => T)) => {
      const prevState = latestHistoryRef.current;
      const { history: prevHistory, currentIndex: prevIndex } =
        prevState;
      const lastState = prevHistory[prevIndex];
      const newState =
        value instanceof Function ? value(lastState) : value;

      if (
        JSON.stringify(newState) === JSON.stringify(lastState)
      ) {
        return;
      }

      const replaced = [...prevHistory];
      replaced[prevIndex] = newState;
      const newHistory = replaced.slice(0, prevIndex + 1);

      const next: HistoryState<T> = {
        history: newHistory,
        currentIndex: newHistory.length - 1,
      };
      latestHistoryRef.current = next;
      setStateInternal(next);
      persistCurrentState(newState);
    },
    [persistCurrentState]
  );

  const undo = useCallback(() => {
    const prevState = latestHistoryRef.current;
    if (prevState.currentIndex <= 0) {
      return;
    }
    const nextIndex = prevState.currentIndex - 1;
    const next: HistoryState<T> = {
      ...prevState,
      currentIndex: nextIndex,
    };
    latestHistoryRef.current = next;
    setStateInternal(next);
    persistCurrentState(prevState.history[nextIndex]);
  }, [persistCurrentState]);

  const redo = useCallback(() => {
    const prevState = latestHistoryRef.current;
    if (prevState.currentIndex >= prevState.history.length - 1) {
      return;
    }
    const nextIndex = prevState.currentIndex + 1;
    const next: HistoryState<T> = {
      ...prevState,
      currentIndex: nextIndex,
    };
    latestHistoryRef.current = next;
    setStateInternal(next);
    persistCurrentState(prevState.history[nextIndex]);
  }, [persistCurrentState]);

  return {
    state: currentState,
    setState,
    setStateWithoutHistory,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
}
