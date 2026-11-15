const FILE_PATH =
  'common/services/shoppingListMigrationData.ts';
import type { ShoppingListData } from '../../types.ts';
import { migrateToCategories } from './backupService.ts';
import { isPlainObject } from './backupItemValidation.ts';
import type { StartupFinding } from './localStorageAuditTypes.ts';
import {
  cleanItemsForStartup,
} from './shoppingListMigrationItems.ts';
import {
  cleanCategoriesForStartup,
} from './shoppingListMigrationCategories.ts';
import {
  buildMigratedLegacyData,
  dropOrphanItems,
} from './shoppingListMigrationLegacy.ts';

export interface ListMigrationResult {
  changed: boolean;
  data: ShoppingListData | null;
  findings: StartupFinding[];
}

export const migrateAndCleanShoppingListData = (
  parsed: unknown
): ListMigrationResult => {
  const findings: StartupFinding[] = [];
  let changed = false;

  if (Array.isArray(parsed)) {
    const itemsRes = cleanItemsForStartup(parsed, findings);
    const ids = itemsRes.items.map((i) => i.id);
    findings.push({
      severity: 'info',
      message:
        'Migrated legacy array format in "shopping-list-data".',
    });
    return {
      changed: true,
      data: migrateToCategories({
        items: itemsRes.items,
        shoppingOrder: ids,
        homeOrder: ids,
      }),
      findings,
    };
  }

  if (!isPlainObject(parsed) || !Array.isArray(parsed.items)) {
    findings.push({
      severity: 'error',
      message:
        '"shopping-list-data" is missing a valid "items" array.',
    });
    return { changed: false, data: null, findings };
  }

  const hasCurrent =
    'shopCategories' in parsed || 'homeCategories' in parsed;
  const hasSections =
    !hasCurrent &&
    ('shopSections' in parsed || 'homeSections' in parsed);
  const hasOrder =
    !hasCurrent &&
    !hasSections &&
    ('shoppingOrder' in parsed || 'homeOrder' in parsed);

  if (!hasCurrent && !hasSections && !hasOrder) {
    findings.push({
      severity: 'error',
      message:
        '"shopping-list-data" is missing category structures.',
    });
    return { changed: false, data: null, findings };
  }

  const allowedRoot = new Set<string>(
    hasCurrent
      ? ['items', 'shopCategories', 'homeCategories']
      : hasSections
        ? ['items', 'shopSections', 'homeSections']
        : ['items', 'shoppingOrder', 'homeOrder']
  );
  const extraRoot = Object.keys(parsed)
    .filter((k) => !allowedRoot.has(k))
    .sort();
  if (extraRoot.length > 0) {
    changed = true;
    findings.push({
      severity: 'warning',
      message:
        'Removed unknown top-level fields: ' +
        extraRoot.map((k) => `"${k}"`).join(', '),
    });
  }

  const itemsRes = cleanItemsForStartup(parsed.items, findings);
  if (itemsRes.changed) changed = true;
  const validIds = new Set(itemsRes.items.map((i) => i.id));

  let data: ShoppingListData;
  if (hasCurrent) {
    const shopRes = cleanCategoriesForStartup(
      parsed.shopCategories,
      'shopCategories',
      validIds,
      findings
    );
    const homeRes = cleanCategoriesForStartup(
      parsed.homeCategories,
      'homeCategories',
      validIds,
      findings
    );
    if (shopRes.changed || homeRes.changed) changed = true;
    data = {
      items: itemsRes.items,
      shopCategories: shopRes.categories,
      homeCategories: homeRes.categories,
    };
  } else {
    changed = true;
    data = buildMigratedLegacyData(
      hasSections ? 'sections' : 'order',
      parsed,
      itemsRes.items,
      validIds,
      findings
    );
  }

  const finalRes = dropOrphanItems(data, findings);
  if (finalRes.changed) changed = true;

  return { changed, data: finalRes.data, findings };
};
