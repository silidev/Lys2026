const FILE_PATH = 'common/services/backupService.ts';
// Architectural Note: Backups intentionally contain ONLY core
// ShoppingListData (items, shopCategories, homeCategories).
// Transient UI view filter settings (e.g. showOnlyUrgent,
// showOnlyDefaultCompleted, hideCompleted) are deliberately
// excluded from backups so that items hidden by filters
// reappear upon restore into a fresh instance. This is by design.
import type {
  Category,
  OldShoppingListDataWithOrder,
  OldShoppingListDataWithSections,
  ShoppingListData,
  ShoppingListItem,
} from '../../types.ts';
import {
  validateAndParseBackup,
  validateItemFields,
  type BackupParseResult,
} from './backupValidation.ts';

export type { BackupParseResult };

export const isShoppingListItem = (
  obj: unknown
): obj is ShoppingListItem => validateItemFields(obj, 0) === null;

const isValidCategory = (obj: unknown): obj is Category => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return false;
  }
  const cat = obj as Partial<Category>;
  return (
    typeof cat.id === 'string' &&
    typeof cat.name === 'string' &&
    Array.isArray(cat.itemIds) &&
    cat.itemIds.every((id) => typeof id === 'string')
  );
};

export const isShoppingListData = (
  obj: unknown
): obj is
  | ShoppingListData
  | OldShoppingListDataWithOrder
  | OldShoppingListDataWithSections => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return false;
  }

  const maybeData = obj as Partial<
    ShoppingListData &
      OldShoppingListDataWithOrder &
      OldShoppingListDataWithSections
  >;

  if (
    !('items' in maybeData) ||
    !Array.isArray(maybeData.items) ||
    !maybeData.items.every(isShoppingListItem)
  ) {
    return false;
  }

  const hasNewFormat =
    'shopCategories' in maybeData &&
    Array.isArray(maybeData.shopCategories) &&
    maybeData.shopCategories.every(isValidCategory) &&
    'homeCategories' in maybeData &&
    Array.isArray(maybeData.homeCategories) &&
    maybeData.homeCategories.every(isValidCategory);
  const hasOldFormat =
    'shoppingOrder' in maybeData &&
    Array.isArray(maybeData.shoppingOrder) &&
    maybeData.shoppingOrder.every((id) => typeof id === 'string') &&
    'homeOrder' in maybeData &&
    Array.isArray(maybeData.homeOrder) &&
    maybeData.homeOrder.every((id) => typeof id === 'string');
  const hasSectionsFormat =
    'shopSections' in maybeData &&
    Array.isArray(maybeData.shopSections) &&
    maybeData.shopSections.every(isValidCategory) &&
    'homeSections' in maybeData &&
    Array.isArray(maybeData.homeSections) &&
    maybeData.homeSections.every(isValidCategory);

  return hasNewFormat || hasOldFormat || hasSectionsFormat;
};

export const migrateFromSections = (
  parsedData: OldShoppingListDataWithSections
): ShoppingListData => ({
  items: parsedData.items,
  shopCategories: parsedData.shopSections,
  homeCategories: parsedData.homeSections,
});

export const migrateToCategories = (
  parsedData: OldShoppingListDataWithOrder
): ShoppingListData => {
  const items = parsedData.items || [];
  const shopOrder = parsedData.shoppingOrder || [];
  const homeOrder = parsedData.homeOrder || [];

  return {
    items,
    shopCategories: [
      { id: 'shop-fridge', name: 'Fridge', itemIds: [] },
      { id: 'shop-freezer', name: 'Freezer', itemIds: [] },
      { id: 'shop-fruit', name: 'Fruit', itemIds: [] },
      { id: 'shop-vegetables', name: 'Vegetables', itemIds: [] },
      {
        id: 'shop-uncategorized',
        name: 'Uncategorized',
        itemIds: shopOrder,
      },
    ],
    homeCategories: [
      { id: 'home-fridge', name: 'Fridge', itemIds: [] },
      { id: 'home-pantry', name: 'Pantry', itemIds: [] },
      { id: 'home-freezer', name: 'Freezer', itemIds: [] },
      {
        id: 'home-uncategorized',
        name: 'Uncategorized',
        itemIds: homeOrder,
      },
    ],
  };
};

export const parseBackupText = (
  rawText: string
): BackupParseResult =>
  validateAndParseBackup(
    rawText,
    migrateFromSections,
    migrateToCategories
  );