const FILE_PATH = 'common/services/backupValidation.ts';
import type {
  OldShoppingListDataWithOrder,
  OldShoppingListDataWithSections,
  ShoppingListData,
  ShoppingListItem,
} from '../../types.ts';
import {
  buildBackupData,
  type BackupFormat,
} from './backupFormatBuilder.ts';
import {
  isPlainObject,
  sanitizeItem,
  validateItemFields,
} from './backupItemValidation.ts';

export { validateItemFields };

export type BackupParseResult =
  | { ok: true; data: ShoppingListData; warnings: string[] }
  | { ok: false; error: string };

const formatKeyCounts = (counts: Map<string, number>): string =>
  Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => `"${key}" (${count}x)`)
    .join(', ');

export const validateAndParseBackup = (
  rawText: string,
  migrateFromSections: (
    d: OldShoppingListDataWithSections
  ) => ShoppingListData,
  migrateToCategories: (
    d: OldShoppingListDataWithOrder
  ) => ShoppingListData
): BackupParseResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Invalid JSON: ${msg}` };
  }

  const unknownItemKeys = new Map<string, number>();
  const unknownCatKeys = new Map<string, number>();
  const unknownRootKeys: string[] = [];

  let itemsRaw: unknown[];
  let format: BackupFormat;

  if (Array.isArray(parsed)) {
    format = 'array';
    itemsRaw = parsed;
  } else if (isPlainObject(parsed)) {
    if (!Array.isArray(parsed.items)) {
      return {
        ok: false,
        error: 'Backup is missing a valid "items" array.',
      };
    }
    itemsRaw = parsed.items;

    const hasCurrent =
      'shopCategories' in parsed && 'homeCategories' in parsed;
    const hasSections =
      'shopSections' in parsed && 'homeSections' in parsed;
    const hasOrder =
      'shoppingOrder' in parsed && 'homeOrder' in parsed;

    if (hasCurrent) {
      format = 'current';
    } else if (hasSections) {
      format = 'sections';
    } else if (hasOrder) {
      format = 'order';
    } else {
      return {
        ok: false,
        error:
          'Backup must contain "shopCategories" and ' +
          '"homeCategories" (or legacy sections/order).',
      };
    }

    const allowedRoot = new Set<string>(
      format === 'current'
        ? ['items', 'shopCategories', 'homeCategories']
        : format === 'sections'
          ? ['items', 'shopSections', 'homeSections']
          : ['items', 'shoppingOrder', 'homeOrder']
    );
    for (const key of Object.keys(parsed)) {
      if (!allowedRoot.has(key)) {
        unknownRootKeys.push(key);
      }
    }
  } else {
    return {
      ok: false,
      error:
        'Backup must be a JSON object or an array of items.',
    };
  }

  const sanitizedItems: ShoppingListItem[] = [];
  for (let i = 0; i < itemsRaw.length; i++) {
    const itemError = validateItemFields(itemsRaw[i], i);
    if (itemError) {
      return { ok: false, error: itemError };
    }
    sanitizedItems.push(
      sanitizeItem(
        itemsRaw[i] as Record<string, unknown>,
        unknownItemKeys
      )
    );
  }

  const built = buildBackupData(
    format,
    parsed,
    sanitizedItems,
    unknownCatKeys,
    migrateFromSections,
    migrateToCategories
  );
  if ('error' in built) {
    return { ok: false, error: built.error };
  }
  const data = built.data;

  const warnings: string[] = [];
  if (unknownRootKeys.length > 0) {
    unknownRootKeys.sort();
    warnings.push(
      'Unknown top-level fields: ' +
        unknownRootKeys.map((k) => `"${k}"`).join(', ')
    );
  }
  if (unknownCatKeys.size > 0) {
    warnings.push(
      `Unknown category fields: ${formatKeyCounts(unknownCatKeys)}`
    );
  }
  if (unknownItemKeys.size > 0) {
    warnings.push(
      `Unknown item fields: ${formatKeyCounts(unknownItemKeys)}`
    );
  }

  return { ok: true, data, warnings };
};
