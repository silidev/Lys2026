const FILE_PATH =
  'common/services/shoppingListMigrationItems.ts';
import type { ShoppingListItem } from '../../types.ts';
import {
  KNOWN_ITEM_KEYS,
  isPlainObject,
} from './backupItemValidation.ts';
import {
  formatKeyCounts,
  type StartupFinding,
} from './localStorageAuditTypes.ts';

const LEGACY_ITEM_KEYS = new Set<string>([
  'isRush',
  'isRushOnce',
  'completed',
]);
const ITEM_STR_KEYS = [
  'nameShop',
  'alias',
  'nameExport',
  'amount',
] as const;
const ITEM_BOOL_KEYS = [
  'defaultCompleted',
  'isUrgent',
  'isUrgentOnce',
  'hideUntilReset',
] as const;

const buildCleanItem = (
  raw: Record<string, unknown>,
  findings: StartupFinding[],
  legacyCounts: Map<string, number>,
  unknownCounts: Map<string, number>
): { item: ShoppingListItem; changed: boolean } => {
  let changed = false;
  const item: ShoppingListItem = {
    id: raw.id as string,
    name: raw.name as string,
  };
  for (const key of ITEM_STR_KEYS) {
    const val = raw[key];
    if (val === undefined) continue;
    if (typeof val === 'string') {
      item[key] = val;
    } else {
      changed = true;
      findings.push({
        severity: 'warning',
        message:
          `Removed invalid item.${key} on ` +
          `"${item.name}" (${item.id}).`,
      });
    }
  }
  for (const key of ITEM_BOOL_KEYS) {
    const val = raw[key];
    if (val === undefined) continue;
    if (typeof val === 'boolean') {
      item[key] = val;
    } else {
      changed = true;
      findings.push({
        severity: 'warning',
        message:
          `Removed invalid item.${key} on ` +
          `"${item.name}" (${item.id}).`,
      });
    }
  }
  for (const key of Object.keys(raw)) {
    if (KNOWN_ITEM_KEYS.has(key)) continue;
    changed = true;
    const target = LEGACY_ITEM_KEYS.has(key)
      ? legacyCounts
      : unknownCounts;
    target.set(key, (target.get(key) ?? 0) + 1);
  }
  return { item, changed };
};

export const cleanItemsForStartup = (
  itemsRaw: unknown[],
  findings: StartupFinding[]
): { items: ShoppingListItem[]; changed: boolean } => {
  let changed = false;
  const items: ShoppingListItem[] = [];
  const seenIds = new Set<string>();
  const legacyCounts = new Map<string, number>();
  const unknownCounts = new Map<string, number>();
  let invalidCount = 0;
  let dupCount = 0;

  for (const entry of itemsRaw) {
    if (
      !isPlainObject(entry) ||
      typeof entry.id !== 'string' ||
      entry.id.trim() === '' ||
      typeof entry.name !== 'string'
    ) {
      invalidCount++;
      changed = true;
      continue;
    }
    if (seenIds.has(entry.id)) {
      dupCount++;
      changed = true;
      continue;
    }
    seenIds.add(entry.id);
    const cleaned = buildCleanItem(
      entry,
      findings,
      legacyCounts,
      unknownCounts
    );
    if (cleaned.changed) changed = true;
    items.push(cleaned.item);
  }
  if (invalidCount > 0) {
    findings.push({
      severity: 'warning',
      message: `Removed ${invalidCount} invalid item(s).`,
    });
  }
  if (dupCount > 0) {
    findings.push({
      severity: 'warning',
      message: `Removed ${dupCount} duplicate item ID(s).`,
    });
  }
  if (legacyCounts.size > 0) {
    findings.push({
      severity: 'info',
      message:
        'Removed ignored legacy item fields: ' +
        formatKeyCounts(legacyCounts),
    });
  }
  if (unknownCounts.size > 0) {
    findings.push({
      severity: 'warning',
      message:
        'Removed unknown item fields: ' +
        formatKeyCounts(unknownCounts),
    });
  }
  return { items, changed };
};
