const FILE_PATH =
  'common/services/localStorageMigrationService.ts';
import storageService from './storageService.ts';
import type {
  StartupFinding,
  StartupMigrationResult,
} from './localStorageAuditTypes.ts';
import { isPlainObject } from './backupItemValidation.ts';
import {
  migrateAndCleanShoppingListData,
} from './shoppingListMigrationData.ts';
import {
  auditSettingsKeys,
  removeUnknownAppKeys,
} from './localStorageSettingAudit.ts';

const auditHistoryAndListData = (
  findings: StartupFinding[]
): { validItemIds: Set<string> | null; hasCorruptList: boolean } => {
  const listKey = 'shopping-list-data';
  const histKey = 'shopping-list-data-history-state';
  const rawList = storageService.getRawItem(listKey);
  const rawHist = storageService.getRawItem(histKey);

  if (rawList === null) {
    if (rawHist === null) {
      return { validItemIds: null, hasCorruptList: false };
    }
    try {
      const parsedHist: unknown = JSON.parse(rawHist);
      if (
        isPlainObject(parsedHist) &&
        Array.isArray(parsedHist.history) &&
        typeof parsedHist.currentIndex === 'number' &&
        parsedHist.currentIndex >= 0 &&
        parsedHist.currentIndex < parsedHist.history.length
      ) {
        const snapshot =
          parsedHist.history[parsedHist.currentIndex];
        const cleaned = migrateAndCleanShoppingListData(snapshot);
        findings.push(...cleaned.findings);
        if (cleaned.data !== null) {
          if (storageService.setItem(listKey, cleaned.data)) {
            storageService.removeItem(histKey);
            findings.push({
              severity: 'info',
              message:
                'Recovered list from legacy undo history ' +
                `"${histKey}".`,
            });
          } else {
            findings.push({
              severity: 'error',
              message:
                `Failed to save recovered list to "${listKey}".`,
            });
          }
          return {
            validItemIds: new Set(
              cleaned.data.items.map((i) => i.id)
            ),
            hasCorruptList: false,
          };
        }
      }
      storageService.removeItem(histKey);
      findings.push({
        severity: 'error',
        message:
          `Removed unusable legacy undo history "${histKey}".`,
      });
    } catch {
      storageService.removeItem(histKey);
      findings.push({
        severity: 'error',
        message:
          `Removed corrupted legacy undo history "${histKey}".`,
      });
    }
    return { validItemIds: null, hasCorruptList: false };
  }

  if (rawHist !== null) {
    storageService.removeItem(histKey);
    findings.push({
      severity: 'info',
      message:
        `Removed obsolete undo history key "${histKey}".`,
    });
  }

  let parsedList: unknown;
  try {
    parsedList = JSON.parse(rawList);
  } catch {
    findings.push({
      severity: 'error',
      message:
        `Saved list data under "${listKey}" could not be ` +
        'parsed and was left untouched to avoid data loss.',
    });
    return { validItemIds: null, hasCorruptList: true };
  }

  const migrated = migrateAndCleanShoppingListData(parsedList);
  findings.push(...migrated.findings);
  if (migrated.data === null) {
    storageService.removeItem(listKey);
    findings.push({
      severity: 'error',
      message:
        `Removed unusable "${listKey}" entry without valid ` +
        'list structure.',
    });
    return { validItemIds: null, hasCorruptList: false };
  }

  if (migrated.changed) {
    if (!storageService.setItem(listKey, migrated.data)) {
      findings.push({
        severity: 'error',
        message:
          `Failed to save cleaned list data to "${listKey}".`,
      });
    }
  }
  return {
    validItemIds: new Set(migrated.data.items.map((i) => i.id)),
    hasCorruptList: false,
  };
};

export const migrateAndAuditLocalStorage =
  (): StartupMigrationResult => {
    const findings: StartupFinding[] = [];
    const allKeys = storageService.getAllKeys().sort();

    removeUnknownAppKeys(allKeys, findings);
    const { validItemIds, hasCorruptList } =
      auditHistoryAndListData(findings);
    auditSettingsKeys(allKeys, validItemIds, findings);

    return { findings, hasCorruptListData: hasCorruptList };
  };
