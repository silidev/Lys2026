const FILE_PATH = 'types.ts';
export interface ShoppingListItem {
  id: string;
  name: string;
  nameShop?: string;
  alias?: string;
  nameExport?: string;
  amount?: string;
  defaultCompleted?: boolean;
  isRush?: boolean;
  isRushOnce?: boolean;
  hideUntilReset?: boolean;
}

export type ViewMode = 'shop' | 'home';

export interface Category {
  id: string;
  name: string;
  itemIds: string[];
}

export interface ShoppingListData {
  items: ShoppingListItem[];
  shopCategories: Category[];
  homeCategories: Category[];
}

export interface OldShoppingListDataWithOrder {
  items: ShoppingListItem[];
  shoppingOrder: string[];
  homeOrder: string[];
}

export interface OldShoppingListDataWithSections {
  items: ShoppingListItem[];
  shopSections: Category[];
  homeSections: Category[];
}

export interface ItemLocation {
  categoryId: string;
  index: number;
}

export interface DragItemData {
  itemId: string;
  categoryId: string;
  index: number;
}