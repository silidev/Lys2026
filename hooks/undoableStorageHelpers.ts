const FILE_PATH = 'hooks/undoableStorageHelpers.ts';
import storageService from '../common/services/storageService.ts';

export interface HistoryState<T> {
  history: T[];
  currentIndex: number;
}

export interface UndoableInitResult<T> {
  initialState: HistoryState<T>;
  persistenceBlocked: boolean;
  startupError: string | null;
}

const isValidHistoryState = <T>(
  candidate: HistoryState<T> | null
): candidate is HistoryState<T> =>
  Boolean(
    candidate &&
      Array.isArray(candidate.history) &&
      candidate.history.length > 0 &&
      typeof candidate.currentIndex === 'number' &&
      candidate.currentIndex >= 0 &&
      candidate.currentIndex < candidate.history.length
  );

export function initializeUndoableState<T>(
  key: string,
  historyStateKey: string,
  initialValue: T
): UndoableInitResult<T> {
  const storedData = storageService.getItem<T>(key);
  if (storedData !== null) {
    return {
      initialState: { history: [storedData], currentIndex: 0 },
      persistenceBlocked: false,
      startupError: null,
    };
  }

  if (storageService.getRawItem(key) !== null) {
    return {
      initialState: {
        history: [initialValue],
        currentIndex: 0,
      },
      persistenceBlocked: true,
      startupError:
        `Saved list data under "${key}" could not be parsed ` +
        'and was left untouched in localStorage to avoid ' +
        'overwriting it.',
    };
  }

  const legacyHistory =
    storageService.getItem<HistoryState<T>>(historyStateKey);
  if (isValidHistoryState(legacyHistory)) {
    const recovered =
      legacyHistory.history[legacyHistory.currentIndex];
    const saved = storageService.setItem(key, recovered);
    if (saved) {
      storageService.removeItem(historyStateKey);
    }
    return {
      initialState: { history: [recovered], currentIndex: 0 },
      persistenceBlocked: false,
      startupError: saved
        ? null
        : `Failed to migrate saved data to "${key}" ` +
          '(browser storage may be full).',
    };
  }

  const savedInitial = storageService.setItem(
    key,
    initialValue
  );
  return {
    initialState: { history: [initialValue], currentIndex: 0 },
    persistenceBlocked: false,
    startupError: savedInitial
      ? null
      : `Failed to save initial data to "${key}" ` +
        '(browser storage may be full).',
  };
}
