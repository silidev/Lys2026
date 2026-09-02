const FILE_PATH = 'common/services/backupService.ts';
import { ShoppingListItem, ShoppingListData, OldShoppingListDataWithOrder, OldShoppingListDataWithSections } from '../../types';

export const isShoppingListItem = (obj: unknown): obj is ShoppingListItem => {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    const item = obj as Partial<ShoppingListItem>;
    return (
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        (item.amount === undefined || typeof item.amount === 'string') &&
        (item.nameShop === undefined || typeof item.nameShop === 'string')
    );
};

export const isShoppingListData = (obj: unknown): obj is ShoppingListData | OldShoppingListDataWithOrder | OldShoppingListDataWithSections => {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        return false;
    }
    
    const maybeData = obj as Partial<ShoppingListData & OldShoppingListDataWithOrder & OldShoppingListDataWithSections>;

    if (!('items' in maybeData) || !Array.isArray(maybeData.items)) {
        return false;
    }

    const hasNewFormat = ('shopCategories' in maybeData && Array.isArray(maybeData.shopCategories) && 'homeCategories' in maybeData && Array.isArray(maybeData.homeCategories));
    const hasOldFormat = ('shoppingOrder' in maybeData && Array.isArray(maybeData.shoppingOrder) && 'homeOrder' in maybeData && Array.isArray(maybeData.homeOrder));
    const hasSectionsFormat = ('shopSections' in maybeData && Array.isArray(maybeData.shopSections) && 'homeSections' in maybeData && Array.isArray(maybeData.homeSections));
    
    return hasNewFormat || hasOldFormat || hasSectionsFormat;
}

export const migrateFromSections = (parsedData: OldShoppingListDataWithSections): ShoppingListData => {
    return {
        items: parsedData.items,
        shopCategories: parsedData.shopSections,
        homeCategories: parsedData.homeSections,
    };
};

export const migrateToCategories = (parsedData: OldShoppingListDataWithOrder): ShoppingListData => {
    const items = parsedData.items || [];
    const shopOrder = parsedData.shoppingOrder || [];
    const homeOrder = parsedData.homeOrder || [];
    
    return {
        items: items,
        shopCategories: [
            { id: 'shop-fridge', name: 'Fridge', itemIds: [] },
            { id: 'shop-freezer', name: 'Freezer', itemIds: [] },
            { id: 'shop-fruit', name: 'Fruit', itemIds: [] },
            { id: 'shop-vegetables', name: 'Vegetables', itemIds: [] },
            { id: 'shop-uncategorized', name: 'Uncategorized', itemIds: shopOrder }
        ],
        homeCategories: [
            { id: 'home-fridge', name: 'Fridge', itemIds: [] },
            { id: 'home-pantry', name: 'Pantry', itemIds: [] },
            { id: 'home-freezer', name: 'Freezer', itemIds: [] },
            { id: 'home-uncategorized', name: 'Uncategorized', itemIds: homeOrder }
        ]
    };
};