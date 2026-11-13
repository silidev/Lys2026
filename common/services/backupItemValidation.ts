const FILE_PATH = 'common/services/backupItemValidation.ts';
import type { Category, ShoppingListItem } from '../../types.ts';

const KNOWN_ITEM_KEYS = new Set<string>([
  'id',
  'name',
  'nameShop',
  'alias',
  'nameExport',
  'amount',
  'defaultCompleted',
  'isUrgent',
  'isUrgentOnce',
  'hideUntilReset',
]);

const KNOWN_CATEGORY_KEYS = new Set<string>([
  'id',
  'name',
  'itemIds',
]);

export const isPlainObject = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const isOptionalString = (value: unknown): boolean =>
  value === undefined || typeof value === 'string';

const isOptionalBoolean = (value: unknown): boolean =>
  value === undefined || typeof value === 'boolean';

export const validateItemFields = (
  raw: unknown,
  index: number
): string | null => {
  if (!isPlainObject(raw)) {
    return `Item at index ${index} is not an object.`;
  }
  if (typeof raw.id !== 'string' || raw.id.trim() === '') {
    return `Item at index ${index} needs a string "id".`;
  }
  if (typeof raw.name !== 'string') {
    return `Item "${raw.id}" needs a string "name".`;
  }
  if (
    !isOptionalString(raw.nameShop) ||
    !isOptionalString(raw.alias) ||
    !isOptionalString(raw.nameExport) ||
    !isOptionalString(raw.amount)
  ) {
    return `Item "${raw.name}" (${raw.id}) has non-string text.`;
  }
  if (
    !isOptionalBoolean(raw.defaultCompleted) ||
    !isOptionalBoolean(raw.isUrgent) ||
    !isOptionalBoolean(raw.isUrgentOnce) ||
    !isOptionalBoolean(raw.hideUntilReset)
  ) {
    return `Item "${raw.name}" (${raw.id}) has non-boolean flag.`;
  }
  return null;
};

export const sanitizeItem = (
  raw: Record<string, unknown>,
  unknownKeys: Map<string, number>
): ShoppingListItem => {
  for (const key of Object.keys(raw)) {
    if (!KNOWN_ITEM_KEYS.has(key)) {
      unknownKeys.set(key, (unknownKeys.get(key) ?? 0) + 1);
    }
  }
  const item: ShoppingListItem = {
    id: raw.id as string,
    name: raw.name as string,
  };
  if (raw.nameShop !== undefined) {
    item.nameShop = raw.nameShop as string;
  }
  if (raw.alias !== undefined) {
    item.alias = raw.alias as string;
  }
  if (raw.nameExport !== undefined) {
    item.nameExport = raw.nameExport as string;
  }
  if (raw.amount !== undefined) {
    item.amount = raw.amount as string;
  }
  if (raw.defaultCompleted !== undefined) {
    item.defaultCompleted = raw.defaultCompleted as boolean;
  }
  if (raw.isUrgent !== undefined) {
    item.isUrgent = raw.isUrgent as boolean;
  }
  if (raw.isUrgentOnce !== undefined) {
    item.isUrgentOnce = raw.isUrgentOnce as boolean;
  }
  if (raw.hideUntilReset !== undefined) {
    item.hideUntilReset = raw.hideUntilReset as boolean;
  }
  return item;
};

export type CategoryValidationResult =
  | { categories: Category[] }
  | { error: string };

export const validateAndSanitizeCategories = (
  rawCategories: unknown,
  label: string,
  unknownCatKeys: Map<string, number>
): CategoryValidationResult => {
  if (!Array.isArray(rawCategories)) {
    return { error: `"${label}" must be an array.` };
  }
  const categories: Category[] = [];
  for (let i = 0; i < rawCategories.length; i++) {
    const rawCat = rawCategories[i];
    if (!isPlainObject(rawCat)) {
      return {
        error: `Entry at ${label}[${i}] is not an object.`,
      };
    }
    if (
      typeof rawCat.id !== 'string' ||
      typeof rawCat.name !== 'string' ||
      !Array.isArray(rawCat.itemIds) ||
      !rawCat.itemIds.every((id) => typeof id === 'string')
    ) {
      return {
        error: `Category at ${label}[${i}] has invalid fields.`,
      };
    }
    for (const key of Object.keys(rawCat)) {
      if (!KNOWN_CATEGORY_KEYS.has(key)) {
        unknownCatKeys.set(
          key,
          (unknownCatKeys.get(key) ?? 0) + 1
        );
      }
    }
    categories.push({
      id: rawCat.id,
      name: rawCat.name,
      itemIds: [...rawCat.itemIds],
    });
  }
  return { categories };
};
