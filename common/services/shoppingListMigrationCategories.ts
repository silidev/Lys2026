const FILE_PATH =
  'common/services/shoppingListMigrationCategories.ts';
import type {
  Category,
  ShoppingListData,
} from '../../types.ts';
import {
  KNOWN_CATEGORY_KEYS,
  isPlainObject,
} from './backupItemValidation.ts';
import {
  formatKeyCounts,
  type StartupFinding,
} from './localStorageAuditTypes.ts';
import {
  cleanItemsForStartup,
} from './shoppingListMigrationItems.ts';

const LEGACY_CATEGORY_KEYS = new Set<string>(['hideable']);

export const cleanCategoriesForStartup = (
  rawCats: unknown,
  label: string,
  validItemIds: Set<string>,
  findings: StartupFinding[]
): { categories: Category[]; changed: boolean } => {
  if (!Array.isArray(rawCats)) {
    findings.push({
      severity: 'error',
      message: `"${label}" was not an array; reset to empty.`,
    });
    return { categories: [], changed: true };
  }
  let changed = false;
  const categories: Category[] = [];
  const seenCats = new Set<string>();
  const legacyCatKeys = new Map<string, number>();
  const unknownCatKeys = new Map<string, number>();
  let invalidCats = 0;
  let dupCats = 0;
  let removedRefs = 0;

  for (const rawCat of rawCats) {
    if (
      !isPlainObject(rawCat) ||
      typeof rawCat.id !== 'string' ||
      rawCat.id.trim() === '' ||
      typeof rawCat.name !== 'string' ||
      !Array.isArray(rawCat.itemIds)
    ) {
      invalidCats++;
      changed = true;
      continue;
    }
    if (seenCats.has(rawCat.id)) {
      dupCats++;
      changed = true;
      continue;
    }
    seenCats.add(rawCat.id);
    const seenRefs = new Set<string>();
    const cleanIds: string[] = [];
    for (const refId of rawCat.itemIds) {
      if (
        typeof refId === 'string' &&
        validItemIds.has(refId) &&
        !seenRefs.has(refId)
      ) {
        seenRefs.add(refId);
        cleanIds.push(refId);
      } else {
        removedRefs++;
        changed = true;
      }
    }
    for (const key of Object.keys(rawCat)) {
      if (KNOWN_CATEGORY_KEYS.has(key)) continue;
      changed = true;
      const target = LEGACY_CATEGORY_KEYS.has(key)
        ? legacyCatKeys
        : unknownCatKeys;
      target.set(key, (target.get(key) ?? 0) + 1);
    }
    categories.push({
      id: rawCat.id,
      name: rawCat.name,
      itemIds: cleanIds,
    });
  }

  if (invalidCats > 0) {
    findings.push({
      severity: 'warning',
      message:
        `Removed ${invalidCats} invalid category entry(ies) ` +
        `in ${label}.`,
    });
  }
  if (dupCats > 0) {
    findings.push({
      severity: 'warning',
      message:
        `Removed ${dupCats} duplicate category ID(s) in ${label}.`,
    });
  }
  if (removedRefs > 0) {
    findings.push({
      severity: 'warning',
      message:
        `Removed ${removedRefs} invalid/dangling item ` +
        `reference(s) in ${label}.`,
    });
  }
  if (legacyCatKeys.size > 0) {
    findings.push({
      severity: 'info',
      message:
        `Removed ignored category fields (${label}): ` +
        formatKeyCounts(legacyCatKeys),
    });
  }
  if (unknownCatKeys.size > 0) {
    findings.push({
      severity: 'warning',
      message:
        `Removed unknown category fields (${label}): ` +
        formatKeyCounts(unknownCatKeys),
    });
  }
  return { categories, changed };
};

export const sanitizeShoppingListDataForBackup = (
  data: ShoppingListData
): ShoppingListData => {
  const dummy: StartupFinding[] = [];
  const validItemSet = new Set(data.items.map((i) => i.id));
  const itemsRes = cleanItemsForStartup(
    data.items as unknown[],
    dummy
  );
  const shopRes = cleanCategoriesForStartup(
    data.shopCategories,
    'shopCategories',
    validItemSet,
    dummy
  );
  const homeRes = cleanCategoriesForStartup(
    data.homeCategories,
    'homeCategories',
    validItemSet,
    dummy
  );
  return {
    items: itemsRes.items,
    shopCategories: shopRes.categories,
    homeCategories: homeRes.categories,
  };
};
