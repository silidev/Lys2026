const FILE_PATH = 'data/defaultData.ts';
import type { ShoppingListItem, Category, ShoppingListData } from '../types';
import { csvItems } from './defaultCsvItems.ts';
import { REMOVE_FROM_VIEW_CATEGORY_NAME } from '../00configs/app.ts';

const defaultItems: ShoppingListItem[] = csvItems.map(item => ({
    id: item.id,
    name: item.name,
    ...(item.crossedOut && { amount: '0' }),
    ...(item.name === "Turkey for thanksgiving" ? { defaultCompleted: true } : {})
}));

const homeCategories: Category[] = [
    { id: 'home-uncategorized', name: 'Uncategorized', itemIds: [] },
    { id: 'home-fridge', name: 'Fridge', itemIds: csvItems.filter(i => i.group === 'Fridge').map(i => i.id) },
    { id: 'home-hidden', name: REMOVE_FROM_VIEW_CATEGORY_NAME, itemIds: csvItems.filter(i => i.group === 'Hidden').map(i => i.id) },
];

const defaultShopCategories: Category[] = [
    { id: 'shop-uncategorized', name: 'Uncategorized', itemIds: []},
    { id: 'shop-fridge', name: 'Fridge', itemIds: defaultItems.map(i => i.id) },
    { id: 'shop-freezer', name: 'Freezer', itemIds: [] },
    { id: 'shop-fruit', name: 'Fruit', itemIds: [] },
    { id: 'shop-vegetables', name: 'Vegetables', itemIds: [] },
    { id: 'shop-hidden', name: REMOVE_FROM_VIEW_CATEGORY_NAME, itemIds: []},
];

export const defaultData: ShoppingListData = {
    items: defaultItems,
    shopCategories: defaultShopCategories,
    homeCategories: homeCategories,
};