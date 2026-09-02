const FILE_PATH = 'common/services/itemService.ts';

import type { ShoppingListData, ShoppingListItem, ViewMode } from '../../types';

export const updateItemAmount = (data: ShoppingListData, id: string, delta: number): ShoppingListData => {
    const items = data.items.map(item => {
        if (item.id !== id) {
            return item;
        }

        let currentValue: number;
        // parseInt will correctly parse leading numbers from strings like "1kg"
        const parsedAmount = parseInt(item.amount || 'not a number', 10);
        
        if (!isNaN(parsedAmount)) {
            currentValue = parsedAmount;
        } else {
            // Fallback for empty or non-numeric strings like "a pinch"
            currentValue = item.amount === '0' ? 0 : 1;
        }

        const newValue = currentValue + delta;

        return {
            ...item,
            amount: String(newValue),
        };
    });

    return { ...data, items };
};

export const updateItem = (data: ShoppingListData, id: string, updates: Partial<Pick<ShoppingListItem, 'name' | 'amount' | 'nameShop' | 'alias' | 'nameExport'>>): ShoppingListData => {
    return {
      ...data,
      items: data.items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    };
};

export const toggleItemCompleted = (data: ShoppingListData, id: string): ShoppingListData => {
    return {
        ...data,
        items: data.items.map(item => {
            if (item.id === id) {
                const isCompleted = item.amount === '0';
                const newAmount = isCompleted ? '1' : '0';

                // If the item is being marked as completed, and it was a one-time urgent, uncheck the one-time urgent flag.
                const newIsUrgentOnce = (newAmount === '0' && item.isRushOnce) ? false : item.isRushOnce;

                return { ...item, isRushOnce: newIsUrgentOnce, amount: newAmount };
            }
            return item;
        }),
    };
};

export const toggleDefaultCompleted = (data: ShoppingListData, id: string): ShoppingListData => {
    return {
        ...data,
        items: data.items.map(item =>
            item.id === id ? { ...item, defaultCompleted: !item.defaultCompleted } : item
        ),
    };
};

export const toggleItemUrgent = (data: ShoppingListData, id: string): ShoppingListData => {
    return {
        ...data,
        items: data.items.map(item =>
            item.id === id ? { ...item, isRush: !item.isRush } : item
        ),
    };
};

export const toggleItemUrgentOnce = (data: ShoppingListData, id: string): ShoppingListData => {
    return {
        ...data,
        items: data.items.map(item =>
            item.id === id ? { ...item, isRushOnce: !item.isRushOnce } : item
        ),
    };
};

export const toggleHideUntilReset = (data: ShoppingListData, id: string): ShoppingListData => {
    return {
        ...data,
        items: data.items.map(item =>
            item.id === id ? { ...item, hideUntilReset: !item.hideUntilReset } : item
        ),
    };
};

export const resetPotentiallyUrgentItems = (data: ShoppingListData, isUrgentMode: boolean): ShoppingListData => {
    if (isUrgentMode) {
        const newItems = data.items.map(item => {
            const processedItem = { ...item, hideUntilReset: false };
            if (item.isRush) {
                const isCompleted = processedItem.amount === '0';
                // If it's often needed (not defaultCompleted) and completed, reset to '1'
                if (!item.defaultCompleted && isCompleted) {
                    processedItem.amount = '1';
                }
            }
            return processedItem;
        });
        return { ...data, items: newItems };
    } else {
        const newItems = data.items.map(item => {
            const processedItem = { ...item, hideUntilReset: false };
            const isCompleted = processedItem.amount === '0';
            
            // If it's often needed (not defaultCompleted) and completed, reset to '1'
            if (!item.defaultCompleted && isCompleted) {
                processedItem.amount = '1';
            }
            
            return processedItem;
        });
        return { ...data, items: newItems };
    }
};

export const getDisplayName = (item: ShoppingListItem, mode: ViewMode): string => {
    if (mode === 'shop' && item.nameShop && item.nameShop.trim()) {
        return item.nameShop;
    }
    return item.name;
};

export const getClipboardDisplayName = (item: ShoppingListItem): string => {
    const name = item.nameExport && item.nameExport.trim() ? item.nameExport : getDisplayName(item, 'shop');
    // Handle cases where amount is null, undefined, or an empty string, defaulting to '1'.
    const amount = (item.amount === null || item.amount === undefined || item.amount === '') ? '1' : item.amount;
    return `${amount} x ${name}`;
};