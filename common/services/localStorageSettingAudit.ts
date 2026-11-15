const FILE_PATH = 'common/services/localStorageSettingAudit.ts';
import storageService from './storageService.ts';
import {
  KNOWN_APP_KEYS,
  isAppLocalStorageKey,
  type StartupFinding,
} from './localStorageAuditTypes.ts';

const BOOL_SETTING_KEYS = new Set<string>([
  'shopping-list-advanced-mode',
  'shopping-list-enable-split-item-names',
  'shopping-list-hide-completed',
  'shopping-list-new-item-default-completed',
  'shopping-list-show-only-default-completed',
  'shopping-list-show-only-urgent',
  'disableRunningUiTestsOnDesktopLoadOnce',
]);

const VALID_THEMES = new Set<string>(['light', 'dark', 'system']);

const isNonNegFinite = (val: unknown): val is number =>
  typeof val === 'number' && Number.isFinite(val) && val >= 0;

const validateSettingValue = (
  key: string,
  val: unknown,
  validItemIds: Set<string> | null
): string | null => {
  if (key === 'theme') {
    return typeof val === 'string' && VALID_THEMES.has(val)
      ? null
      : 'expected "light", "dark", or "system"';
  }
  if (
    key === 'lys-last-manual-backup-timestamp' ||
    key === 'shopping-list-autobackup-interval-h'
  ) {
    return isNonNegFinite(val)
      ? null
      : 'expected non-negative finite number';
  }
  if (BOOL_SETTING_KEYS.has(key)) {
    return typeof val === 'boolean' ? null : 'expected boolean';
  }
  if (key === 'shopping-list-last-interacted-in-home-view') {
    if (val === null) return null;
    if (typeof val !== 'string' || val.trim() === '') {
      return 'expected non-empty item ID or null';
    }
    if (validItemIds && !validItemIds.has(val)) {
      return `referenced missing item "${val}"`;
    }
    return null;
  }
  return null;
};

export const removeUnknownAppKeys = (
  allKeys: string[],
  findings: StartupFinding[]
): void => {
  for (const key of allKeys) {
    if (!isAppLocalStorageKey(key)) continue;
    if (!KNOWN_APP_KEYS.has(key)) {
      storageService.removeItem(key);
      findings.push({
        severity: 'warning',
        message: `Removed unknown app storage key "${key}".`,
      });
    }
  }
};

export const auditSettingsKeys = (
  allKeys: string[],
  validItemIds: Set<string> | null,
  findings: StartupFinding[]
): void => {
  for (const key of allKeys) {
    if (
      !KNOWN_APP_KEYS.has(key) ||
      key === 'shopping-list-data' ||
      key === 'shopping-list-data-history-state'
    ) {
      continue;
    }
    const raw = storageService.getRawItem(key);
    if (raw === null) continue;
    try {
      const parsed: unknown = JSON.parse(raw);
      const reason = validateSettingValue(
        key,
        parsed,
        validItemIds
      );
      if (reason) {
        storageService.removeItem(key);
        findings.push({
          severity: 'warning',
          message:
            `Removed invalid value for "${key}" (${reason}).`,
        });
      }
    } catch {
      storageService.removeItem(key);
      findings.push({
        severity: 'error',
        message:
          `Removed corrupted setting "${key}" (invalid JSON).`,
      });
    }
  }
};
