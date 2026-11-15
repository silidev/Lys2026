const FILE_PATH =
  'common/services/shoppingListMigrationLegacy.ts';
import type { ShoppingListData } from '../../types.ts';
import {
  migrateFromSections,
  migrateToCategories,
} from './backupService.ts';
import type { StartupFinding } from './localStorageAuditTypes.ts';
import {
  cleanCategoriesForStartup,
} from './shoppingListMigrationCategories.ts';
import type { ShoppingListItem } from '../../types.ts';

export const cleanOrderList = (
  rawOrder: unknown,
  label: string,
  validItemIds: Set<string>,
  findings: StartupFinding[]
): { ids: string[]; changed: boolean } => {
  if (!Array.isArray(rawOrder)) {
    findings.push({
      severity: 'warning',
      message: `"${label}" was invalid; reset to empty.`,
    });
    return { ids: [], changed: true };
  }
  const seen = new Set<string>();
  const ids: string[] = [];
  let dropped = 0;
  for (const id of rawOrder) {
    if (
      typeof id === 'string' &&
      validItemIds.has(id) &&
      !seen.has(id)
    ) {
      seen.add(id);
      ids.push(id);
    } else {
      dropped++;
    }
  }
  if (dropped > 0) {
    findings.push({
      severity: 'warning',
      message:
        `Removed ${dropped} invalid/dangling ID(s) in ` +
        `"${label}".`,
    });
  }
  return { ids, changed: dropped > 0 };
};

export const dropOrphanItems = (
  data: ShoppingListData,
  findings: StartupFinding[]
): { data: ShoppingListData; changed: boolean } => {
  const referenced = new Set<string>();
  for (const cat of data.shopCategories) {
    for (const id of cat.itemIds) referenced.add(id);
  }
  for (const cat of data.homeCategories) {
    for (const id of cat.itemIds) referenced.add(id);
  }
  const kept = data.items.filter((i) => referenced.has(i.id));
  const orphanCount = data.items.length - kept.length;
  if (orphanCount <= 0) {
    return { data, changed: false };
  }
  findings.push({
    severity: 'warning',
    message:
      `Removed ${orphanCount} orphaned item(s) not ` +
      'referenced in any category.',
  });
  return {
    data: { ...data, items: kept },
    changed: true,
  };
};

export const buildMigratedLegacyData = (
  mode: 'sections' | 'order',
  parsed: Record<string, unknown>,
  items: ShoppingListItem[],
  validIds: Set<string>,
  findings: StartupFinding[]
): ShoppingListData => {
  if (mode === 'sections') {
    const shopRes = cleanCategoriesForStartup(
      parsed.shopSections,
      'shopSections',
      validIds,
      findings
    );
    const homeRes = cleanCategoriesForStartup(
      parsed.homeSections,
      'homeSections',
      validIds,
      findings
    );
    findings.push({
      severity: 'info',
      message:
        'Migrated legacy sections format in ' +
        '"shopping-list-data".',
    });
    return migrateFromSections({
      items,
      shopSections: shopRes.categories,
      homeSections: homeRes.categories,
    });
  }
  const shopOrd = cleanOrderList(
    parsed.shoppingOrder,
    'shoppingOrder',
    validIds,
    findings
  );
  const homeOrd = cleanOrderList(
    parsed.homeOrder,
    'homeOrder',
    validIds,
    findings
  );
  findings.push({
    severity: 'info',
    message:
      'Migrated legacy order format in "shopping-list-data".',
  });
  return migrateToCategories({
    items,
    shoppingOrder: shopOrd.ids,
    homeOrder: homeOrd.ids,
  });
};
