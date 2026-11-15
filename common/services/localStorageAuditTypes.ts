const FILE_PATH = 'common/services/localStorageAuditTypes.ts';

export type FindingSeverity = 'info' | 'warning' | 'error';

export interface StartupFinding {
  severity: FindingSeverity;
  message: string;
}

export interface StartupMigrationResult {
  findings: StartupFinding[];
  hasCorruptListData: boolean;
}

export const KNOWN_APP_KEYS = new Set<string>([
  'shopping-list-data',
  'shopping-list-data-history-state',
  'theme',
  'lys-last-manual-backup-timestamp',
  'shopping-list-autobackup-interval-h',
  'shopping-list-advanced-mode',
  'shopping-list-enable-split-item-names',
  'shopping-list-hide-completed',
  'shopping-list-new-item-default-completed',
  'shopping-list-show-only-default-completed',
  'shopping-list-show-only-urgent',
  'shopping-list-last-interacted-in-home-view',
  'disableRunningUiTestsOnDesktopLoadOnce',
]);

export const APP_KEY_PREFIXES: readonly string[] = [
  'shopping-list-',
  'lys-',
];

export const isAppLocalStorageKey = (key: string): boolean =>
  KNOWN_APP_KEYS.has(key) ||
  APP_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));

export const formatKeyCounts = (
  counts: Map<string, number>
): string =>
  Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => `"${key}" (${count}x)`)
    .join(', ');
