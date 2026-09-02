const FILE_PATH = 'testing/suites/hooks/useShoppingListData.test.suite.ts';
import { renderHook, act } from '@testing-library/react';
import { useShoppingListData } from '../../../hooks/useShoppingListData.ts';
import { runComponentTest, type User } from '../../helpers.ts';
import type { MockStorageService } from '../../mocks/storageService.mock.ts';
import type { ShoppingListData } from '../../../types.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';

const testUndoAddItem = async (user: User, mockStorage: MockStorageService) => {
    mockStorage.setItem('shopping-list-data', { items: []
        , shopCategories: [{id: 's1', name: 'Uncategorized', itemIds:[]}]
        , homeCategories: [{id: 'h1', name: 'Uncategorized', itemIds:[]}] });
    const { result } = renderHook(() => useShoppingListData('home', () => {}));

    const initialItemCount = result.current.data.items.length;

    act(() => {
        result.current.handleAddItem('New Item', false);
    });

    assertEquals(result.current.data.items.length, initialItemCount + 1);
    assertEquals(result.current.data.items[initialItemCount].name, 'New Item');

    act(() => {
        result.current.handleUndo();
    });

    assertEquals(result.current.data.items.length, initialItemCount);
    assertEquals(result.current.data.items.find(i => i.name === 'New Item'), undefined);
};

const testRedoAddItem = async (user: User, mockStorage: MockStorageService) => {
    mockStorage.setItem('shopping-list-data', { items: [], shopCategories: [{id: 's1', name: 'Uncategorized', itemIds:[]}], homeCategories: [{id: 'h1', name: 'Uncategorized', itemIds:[]}] });
    const { result } = renderHook(() => useShoppingListData('home', () => {}));
    
    const initialItemCount = result.current.data.items.length;
    
    act(() => {
        result.current.handleAddItem('Another New Item', false);
    });
    
    act(() => {
        result.current.handleUndo();
    });

    act(() => {
        result.current.handleRedo();
    });

    assertEquals(result.current.data.items.length, initialItemCount + 1);
    const redoneItem = result.current.data.items[initialItemCount];
    assertEquals(!!redoneItem, true, "Redone item should exist");
    assertEquals(redoneItem.name, 'Another New Item');
};

const testUndoToggleItem = async (user: User, mockStorage: MockStorageService) => {
    const initialData = {
        items: [{ id: '1', name: 'Milk', amount: '1' }],
        shopCategories: [{id: 's1', name: 'Uncategorized', itemIds:['1']}],
        homeCategories: [{id: 'h1', name: 'Uncategorized', itemIds:['1']}],
    };
    mockStorage.setItem('shopping-list-data', initialData);
    const { result } = renderHook(() => useShoppingListData('home', () => {}));

    act(() => {
        result.current.handleToggleItemCompleted('1');
    });

    let milkItem = result.current.itemMap.get('1');
    assertEquals(!!milkItem, true, "Milk item should exist");
    assertEquals(milkItem!.amount, '0');

    act(() => {
        result.current.handleUndo();
    });

    milkItem = result.current.itemMap.get('1');
    assertEquals(!!milkItem, true, "Milk item should exist after undo");
    assertEquals(milkItem!.amount, '1', 'Undo should revert the completed state');
};

const testUndoDeleteItem = async (user: User, mockStorage: MockStorageService) => {
    const initialData = {
        items: [{ id: '1', name: 'Milk' }],
        shopCategories: [{id: 's1', name: 'Uncategorized', itemIds:['1']}],
        homeCategories: [{id: 'h1', name: 'Uncategorized', itemIds:['1']}],
    };
    mockStorage.setItem('shopping-list-data', initialData);
    const { result } = renderHook(() => useShoppingListData('home', () => {}));

    act(() => { result.current.handleDeleteItem('1'); });
    assertEquals(result.current.data.items, []);

    act(() => { result.current.handleUndo(); });
    assertEquals(result.current.data.items.length, 1);
    assertEquals(result.current.data.items[0].name, 'Milk');
};

const testUndoReset = async (user: User, mockStorage: MockStorageService) => {
    const initialData: ShoppingListData = {
        items: [
            { id: '1', name: 'Milk', amount: '0', defaultCompleted: false },
            { id: '2', name: 'Bread', defaultCompleted: true },
            { id: '3', name: 'Eggs', amount: '0' },
        ],
        shopCategories: [{id: 's1', name: 'Uncategorized', itemIds:['1', '2', '3']}],
        homeCategories: [{id: 'h1', name: 'Uncategorized', itemIds:['1', '2', '3']}],
    };
    mockStorage.setItem('shopping-list-data', initialData);
    const { result } = renderHook(() => useShoppingListData('home', () => {}));

    act(() => { result.current.handleReset(false); });

    // '1' (Milk) is "Often needed" (defaultCompleted: false) and was completed ('0').
    // Reset should set it to '1'.
    assertEquals(result.current.itemMap.get('1')!.amount, '1');
    
    // Item '2' has defaultCompleted: true, so its status should NOT change.
    // It started as unchecked, so it should remain unchecked.
    assertEquals(result.current.itemMap.get('2')!.amount, undefined);
    
    // '3' (Eggs) is "Often needed" (defaultCompleted: undefined -> false) and was completed ('0').
    // Reset should set it to '1'.
    assertEquals(result.current.itemMap.get('3')!.amount, '1');

    act(() => { result.current.handleUndo(); });

    assertEquals(result.current.itemMap.get('1')!.amount, '0');
    assertEquals(result.current.itemMap.get('2')!.amount, undefined);
    assertEquals(result.current.itemMap.get('3')!.amount, '0');
};

const testUndoUpdateItem = async (user: User, mockStorage: MockStorageService) => {
    const initialData: ShoppingListData = {
        items: [{ id: '1', name: 'Milk', amount: '1l' }],
        shopCategories: [{id: 's1', name: 'Uncategorized', itemIds:['1']}],
        homeCategories: [{id: 'h1', name: 'Uncategorized', itemIds:['1']}],
    };
    mockStorage.setItem('shopping-list-data', initialData);
    const { result } = renderHook(() => useShoppingListData('home', () => {}));

    act(() => { result.current.handleUpdateItem('1', { name: 'Whole Milk', amount: '2l' }); });
    const updatedItem = result.current.data.items.find(i => i.id === '1');
    assertEquals(updatedItem?.name, 'Whole Milk');
    assertEquals(updatedItem?.amount, '2l');

    act(() => { result.current.handleUndo(); });
    const undoneItem = result.current.data.items.find(i => i.id === '1');
    assertEquals(undoneItem?.name, 'Milk');
    assertEquals(undoneItem?.amount, '1l');
};

const testUndoRestore = async (user: User, mockStorage: MockStorageService) => {
    const initialData: ShoppingListData = {
        items: [{ id: '1', name: 'Milk' }],
        shopCategories: [{id: 's1', name: 'Uncategorized', itemIds:['1']}],
        homeCategories: [{id: 'h1', name: 'Uncategorized', itemIds:['1']}],
    };
    const restoreData: ShoppingListData = {
        items: [{ id: '2', name: 'Bread', amount: '0' }],
        shopCategories: [{id: 's1', name: 'Bakery', itemIds:['2']}],
        homeCategories: [{id: 'h1', name: 'Bakery', itemIds:['2']}],
    };
    mockStorage.setItem('shopping-list-data', initialData);
    const { result } = renderHook(() => useShoppingListData('home', () => {}));

    act(() => { result.current.handleRestore(restoreData); });
    assertEquals(result.current.data, restoreData);

    act(() => { result.current.handleUndo(); });
    assertEquals(result.current.data, initialData);
};

const testUndoReorderItem = async (user: User, mockStorage: MockStorageService) => {
    const initialData: ShoppingListData = {
        items: [
            { id: '1', name: 'Milk' },
            { id: '2', name: 'Bread' },
        ],
        shopCategories: [{id: 's1', name: 'Uncategorized', itemIds:['1', '2']}],
        homeCategories: [{id: 'h1', name: 'Uncategorized', itemIds:['1', '2']}],
    };
    mockStorage.setItem('shopping-list-data', initialData);
    const { result } = renderHook(() => useShoppingListData('home', () => {}));

    act(() => { result.current.handleReorderItem({ categoryId: 'h1', index: 0 }, { categoryId: 'h1', index: 1 }); });
    assertEquals(result.current.data.homeCategories[0].itemIds, ['2', '1']);

    act(() => { result.current.handleUndo(); });
    assertEquals(result.current.data.homeCategories[0].itemIds, ['1', '2']);
};

const testUndoMoveItemToCategory = async (user: User, mockStorage: MockStorageService) => {
    const initialData: ShoppingListData = {
        items: [{ id: '1', name: 'Cheese' }],
        shopCategories: [
            {id: 's1', name: 'Dairy', itemIds:['1']},
            {id: 's2', name: 'Produce', itemIds:[]},
        ],
        homeCategories: [{id: 'h1', name: 'Uncategorized', itemIds:['1']}],
    };
    mockStorage.setItem('shopping-list-data', initialData);
    const { result } = renderHook(() => useShoppingListData('shop', () => {}));

    act(() => { result.current.handleMoveItemToCategory('1', 's2', 'shop'); });
    assertEquals(result.current.data.shopCategories.find(c => c.id === 's1')?.itemIds.length, 0);
    assertEquals(result.current.data.shopCategories.find(c => c.id === 's2')?.itemIds[0], '1');

    act(() => { result.current.handleUndo(); });
    assertEquals(result.current.data.shopCategories.find(c => c.id === 's1')?.itemIds[0], '1');
    assertEquals(result.current.data.shopCategories.find(c => c.id === 's2')?.itemIds.length, 0);
};

export function useShoppingListDataTestSuite() {
    const SUITE_NAME = useShoppingListDataTestSuite.name;
    return [
        runComponentTest('useShoppingListData: should undo adding an item', testUndoAddItem, SUITE_NAME, FILE_PATH),
        runComponentTest('useShoppingListData: should redo adding an item', testRedoAddItem, SUITE_NAME, FILE_PATH),
        runComponentTest('useShoppingListData: should undo toggling an item', testUndoToggleItem, SUITE_NAME, FILE_PATH),
        runComponentTest('useShoppingListData: should undo deleting an item', testUndoDeleteItem, SUITE_NAME, FILE_PATH),
        runComponentTest('useShoppingListData: should undo a list reset', testUndoReset, SUITE_NAME, FILE_PATH),
        runComponentTest('useShoppingListData: should undo updating an item', testUndoUpdateItem, SUITE_NAME, FILE_PATH),
        runComponentTest('useShoppingListData: should undo a restore', testUndoRestore, SUITE_NAME, FILE_PATH),
        runComponentTest('useShoppingListData: should undo reordering an item', testUndoReorderItem, SUITE_NAME, FILE_PATH),
        runComponentTest('useShoppingListData: should undo moving an item to another category', testUndoMoveItemToCategory, SUITE_NAME, FILE_PATH),
    ];
}