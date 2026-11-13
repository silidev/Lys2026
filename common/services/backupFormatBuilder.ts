const FILE_PATH = 'common/services/backupFormatBuilder.ts';
import type {
  OldShoppingListDataWithOrder,
  OldShoppingListDataWithSections,
  ShoppingListData,
  ShoppingListItem,
} from '../../types.ts';
import {
  validateAndSanitizeCategories,
} from './backupItemValidation.ts';

export type BackupFormat =
  | 'array'
  | 'current'
  | 'sections'
  | 'order';

export type BuildBackupResult =
  | { data: ShoppingListData }
  | { error: string };

export const buildBackupData = (
  format: BackupFormat,
  parsed: unknown,
  sanitizedItems: ShoppingListItem[],
  unknownCatKeys: Map<string, number>,
  migrateFromSections: (
    d: OldShoppingListDataWithSections
  ) => ShoppingListData,
  migrateToCategories: (
    d: OldShoppingListDataWithOrder
  ) => ShoppingListData
): BuildBackupResult => {
  if (format === 'array') {
    const itemIds = sanitizedItems.map((i) => i.id);
    return {
      data: migrateToCategories({
        items: sanitizedItems,
        shoppingOrder: itemIds,
        homeOrder: itemIds,
      }),
    };
  }

  const obj = parsed as Record<string, unknown>;
  if (format === 'current') {
    const shopRes = validateAndSanitizeCategories(
      obj.shopCategories,
      'shopCategories',
      unknownCatKeys
    );
    if ('error' in shopRes) {
      return { error: shopRes.error };
    }
    const homeRes = validateAndSanitizeCategories(
      obj.homeCategories,
      'homeCategories',
      unknownCatKeys
    );
    if ('error' in homeRes) {
      return { error: homeRes.error };
    }
    return {
      data: {
        items: sanitizedItems,
        shopCategories: shopRes.categories,
        homeCategories: homeRes.categories,
      },
    };
  }

  if (format === 'sections') {
    const shopRes = validateAndSanitizeCategories(
      obj.shopSections,
      'shopSections',
      unknownCatKeys
    );
    if ('error' in shopRes) {
      return { error: shopRes.error };
    }
    const homeRes = validateAndSanitizeCategories(
      obj.homeSections,
      'homeSections',
      unknownCatKeys
    );
    if ('error' in homeRes) {
      return { error: homeRes.error };
    }
    return {
      data: migrateFromSections({
        items: sanitizedItems,
        shopSections: shopRes.categories,
        homeSections: homeRes.categories,
      }),
    };
  }

  if (
    !Array.isArray(obj.shoppingOrder) ||
    !obj.shoppingOrder.every((id) => typeof id === 'string')
  ) {
    return {
      error: '"shoppingOrder" must be an array of IDs.',
    };
  }
  if (
    !Array.isArray(obj.homeOrder) ||
    !obj.homeOrder.every((id) => typeof id === 'string')
  ) {
    return {
      error: '"homeOrder" must be an array of IDs.',
    };
  }
  return {
    data: migrateToCategories({
      items: sanitizedItems,
      shoppingOrder: [...obj.shoppingOrder],
      homeOrder: [...obj.homeOrder],
    }),
  };
};
