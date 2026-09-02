const FILE_PATH = 'testing/suites/services/listService.test.suite.ts';
import { runLogicTest } from '../../helpers.ts';
import * as listService from '../../../common/services/listService.ts';
import type { ShoppingListData, ItemLocation } from '../../../types.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { REMOVE_FROM_VIEW_CATEGORY_NAME } from '../../../00configs/app.ts';

const getBaseData = (): ShoppingListData => ({
    items: [
        { id: '1', name: 'Milk', amount: '1', alias: 'Dairy' },
        { id: '2', name: 'Bread', amount: '1' },
    ],
    shopCategories: [
        { id: 's1', name: 'Dairy', itemIds: ['1'] },
        { id: 's2', name: 'Bakery', itemIds: ['2'] },
    ],
    homeCategories: [
        { id: 'h1', name: 'Fridge', itemIds: ['1'] },
        { id: 'h2', name: 'Pantry', itemIds: ['2'] },
    ],
});

const testAddItem = () => {
    const data: ShoppingListData = { items: [], shopCategories: [{ id: 's1', name: 'Uncategorized', itemIds: [] }], homeCategories: [{ id: 'h1', name: 'Uncategorized', itemIds: [] }] };
    const [newData, newItemId] = listService.addItem(data, 'Cheese', false);
    
    assertEquals(newData.items.length, 1);
    assertEquals(newData.items[0].name, 'Cheese');
    assertEquals(newData.items[0].id, newItemId);
    assertEquals(newData.items[0].isRush, true, "New items should be urgent by default");

    assertEquals(newData.shopCategories[0].itemIds.includes(newItemId), true, "New item should be in shop category");
    assertEquals(newData.homeCategories[0].itemIds.includes(newItemId), true, "New item should be in home category");
};

const testDeleteItem = () => {
    const data = getBaseData();
    const newData = listService.deleteItem(data, '1');

    assertEquals(newData.items.some(i => i.id === '1'), false, "Item 1 should be deleted from items list");
    assertEquals(newData.shopCategories[0].itemIds.includes('1'), false, "Item 1 should be deleted from shop category");
    assertEquals(newData.homeCategories[0].itemIds.includes('1'), false, "Item 1 should be deleted from home category");
};

const testCloneItem = () => {
    const data = getBaseData();
    const newData = listService.cloneItem(data, '1'); // Clone Milk

    assertEquals(newData.items.length, 3, "Should have 3 items after cloning");
    
    const originalItem = newData.items.find(i => i.id === '1');
    const clonedItem = newData.items.find(i => i.id !== '1' && i.id !== '2');
    
    assertEquals(!!clonedItem, true, "Cloned item should exist");
    assertEquals(clonedItem?.name, originalItem?.name, "Cloned item should have same name");
    assertEquals(clonedItem?.amount, originalItem?.amount, "Cloned item should have same amount");
    assertEquals(clonedItem?.alias, originalItem?.alias, "Cloned item should have same alias");
    
    const dairyCategory = newData.shopCategories.find(s => s.id === 's1');
    const fridgeCategory = newData.homeCategories.find(h => h.id === 'h1');
    
    assertEquals(dairyCategory?.itemIds.includes(clonedItem!.id), true, "Cloned item should be in same shop category");
    assertEquals(fridgeCategory?.itemIds.includes(clonedItem!.id), true, "Cloned item should be in same home category");
    
    // Check order: original should be followed by clone
    const milkIndex = dairyCategory!.itemIds.indexOf('1');
    const cloneIndex = dairyCategory!.itemIds.indexOf(clonedItem!.id);
    assertEquals(cloneIndex, milkIndex + 1, "Clone should be placed immediately after original");
};

const testReorderItemWithinCategory = () => {
    const data = getBaseData();
    data.shopCategories[0].itemIds.push('3'); // Add another item to reorder
    const source: ItemLocation = { categoryId: 's1', index: 0 }; // Milk
    const destination: ItemLocation = { categoryId: 's1', index: 1 };
    const newData = listService.reorderItem(data, source, destination, 'shop');

    assertEquals(newData.shopCategories[0].itemIds, ['3', '1']);
};

const testReorderItemBetweenCategories = () => {
    const data = getBaseData();
    const source: ItemLocation = { categoryId: 's1', index: 0 }; // Milk from Dairy
    const destination: ItemLocation = { categoryId: 's2', index: 1 }; // to end of Bakery
    const newData = listService.reorderItem(data, source, destination, 'shop');

    assertEquals(newData.shopCategories.find(s => s.id === 's1')?.itemIds, []);
    assertEquals(newData.shopCategories.find(s => s.id === 's2')?.itemIds, ['2', '1']);
};

const testMoveItemToCategory = () => {
    const data = getBaseData();
    const newData = listService.moveItemToCategory(data, '1', 's2', 'shop'); // Move Milk to Bakery

    assertEquals(newData.shopCategories.find(s => s.id === 's1')?.itemIds, []);
    assertEquals(!!newData.shopCategories.find(s => s.id === 's2')?.itemIds.includes('1'), true, "Item 1 should have been moved to category s2");
    assertEquals(!!newData.homeCategories.find(s => s.id === 'h1')?.itemIds.includes('1'), true, "Home categories should be unchanged");
};

const testAddItemToFrontOfUncategorized = () => {
    const data: ShoppingListData = {
        items: [
            { id: 'existing-1', name: 'Old Item 1' },
            { id: 'existing-2', name: 'Old Item 2' },
        ],
        shopCategories: [
            { id: 's1', name: 'Other', itemIds: [] },
            { id: 's2', name: 'Uncategorized', itemIds: ['existing-1', 'existing-2'] },
        ],
        homeCategories: [
            { id: 'h1', name: 'Uncategorized', itemIds: ['existing-1', 'existing-2'] },
            { id: 'h2', name: 'Other Home', itemIds: [] },
        ],
    };

    const [newData, newItemId] = listService.addItem(data, 'New Item', false);

    assertEquals(!!newItemId, true, "New item should be created");

    const shopUncategorized = newData.shopCategories.find(s => s.name === 'Uncategorized');
    assertEquals(!!shopUncategorized, true, "Shop uncategorized category should exist");
    assertEquals(shopUncategorized?.itemIds[0], newItemId, "New item should be the first in shop uncategorized category");
    assertEquals(shopUncategorized?.itemIds.length, 3);

    const homeUncategorized = newData.homeCategories.find(s => s.name === 'Uncategorized');
    assertEquals(!!homeUncategorized, true, "Home uncategorized category should exist");
    assertEquals(homeUncategorized?.itemIds[0], newItemId, "New item should be the first in home uncategorized category");
    assertEquals(homeUncategorized?.itemIds.length, 3);
};

const testAddItemCreatesUncategorizedCategoryFirst = () => {
    const initialData: ShoppingListData = {
        items: [],
        shopCategories: [ { id: 's1', name: 'A Category', itemIds: [] } ],
        homeCategories: [ { id: 'h1', name: 'B Category', itemIds: [] } ],
    };

    const [updatedData] = listService.addItem(initialData, 'New Item', false);

    // Expected state
    const expectedShopCategoryNames = ['Uncategorized', 'A Category'];
    const expectedHomeCategoryNames = ['Uncategorized', 'B Category'];

    // Actual state
    const actualShopCategoryNames = updatedData.shopCategories.map(s => s.name);
    const actualHomeCategoryNames = updatedData.homeCategories.map(s => s.name);

    // Assert
    assertEquals(
        actualShopCategoryNames, 
        expectedShopCategoryNames, 
        "Shop categories should have 'Uncategorized' prepended"
    );

    assertEquals(
        actualHomeCategoryNames, 
        expectedHomeCategoryNames,
        "Home categories should have 'Uncategorized' prepended"
    );
};

const getDeletionTestData = (): ShoppingListData => ({
    items: [
        { id: '1', name: 'Item to delete' },
        { id: '2', name: 'Item to keep' },
    ],
    shopCategories: [
        { id: 's_normal', name: 'Normal Shop', itemIds: ['1', '2'] },
        { id: 's_delete', name: REMOVE_FROM_VIEW_CATEGORY_NAME, itemIds: [] },
    ],
    homeCategories: [
        { id: 'h_normal', name: 'Normal Home', itemIds: ['1', '2'] },
        { id: 'h_delete', name: REMOVE_FROM_VIEW_CATEGORY_NAME, itemIds: [] },
    ],
});

const testMoveToShopDeleteDoesNotDeleteItem = () => {
    const data = getDeletionTestData();
    const updatedData = listService.moveItemToCategory(data, '1', 's_delete', 'shop');
    
    assertEquals(updatedData.items.length, 2, "Item should not be deleted from master list yet");
    assertEquals(updatedData.items.some(i => i.id === '1'), true, "Item 1 should still exist in master list");

    const shopNormalCategory = updatedData.shopCategories.find(s => s.id === 's_normal');
    assertEquals(shopNormalCategory?.itemIds.includes('1'), false, "Item 1 should be removed from normal shop category");
    
    const shopDeleteCategory = updatedData.shopCategories.find(s => s.id === 's_delete');
    assertEquals(shopDeleteCategory?.itemIds.includes('1'), true, "Item 1 should be in shop delete category");
    
    const homeNormalCategory = updatedData.homeCategories.find(s => s.id === 'h_normal');
    assertEquals(homeNormalCategory?.itemIds.includes('1'), true, "Item 1 should still be in normal home category");
};

const testMoveToShopDeleteDeletesItemIfInHomeDeleteView = () => {
    let data = getDeletionTestData();
    // Pre-condition: move item 1 to home delete view
    data = listService.moveItemToCategory(data, '1', 'h_delete', 'home');

    // Action: move item 1 to shop delete view
    const updatedData = listService.moveItemToCategory(data, '1', 's_delete', 'shop');

    assertEquals(updatedData.items.length, 1, "Item should be deleted from master list");
    assertEquals(updatedData.items.some(i => i.id === '1'), false, "Item 1 should not exist in master list");
    assertEquals(updatedData.items[0].id, '2', "Item 2 should be the only one left");
    
    updatedData.shopCategories.forEach(s => {
        assertEquals(s.itemIds.includes('1'), false, `Item 1 should not be in any shop category, but was in ${s.name}`);
    });
    updatedData.homeCategories.forEach(s => {
        assertEquals(s.itemIds.includes('1'), false, `Item 1 should not be in any home category, but was in ${s.name}`);
    });
};

const testMoveToHomeDeleteDeletesItemIfInShopDeleteView = () => {
    let data = getDeletionTestData();
    // Pre-condition: move item 1 to shop delete view
    data = listService.moveItemToCategory(data, '1', 's_delete', 'shop');

    // Action: move item 1 to home delete view
    const updatedData = listService.moveItemToCategory(data, '1', 'h_delete', 'home');

    assertEquals(updatedData.items.length, 1, "Item should be deleted from master list");
    assertEquals(updatedData.items.some(i => i.id === '1'), false, "Item 1 should not exist in master list");

    updatedData.shopCategories.forEach(s => {
        assertEquals(s.itemIds.includes('1'), false, `Item 1 should not be in any shop category, but was in ${s.name}`);
    });
    updatedData.homeCategories.forEach(s => {
        assertEquals(s.itemIds.includes('1'), false, `Item 1 should not be in any home category, but was in ${s.name}`);
    });
};

export function listServiceTestSuite() {
    const SUITE_NAME = listServiceTestSuite.name;
    return [
        runLogicTest('List Service: addItem adds an item correctly', testAddItem, SUITE_NAME, FILE_PATH),
        runLogicTest('List Service: deleteItem removes an item from all lists', testDeleteItem, SUITE_NAME, FILE_PATH),
        runLogicTest('List Service: cloneItem creates a duplicate item in the same categories', testCloneItem, SUITE_NAME, FILE_PATH),
        runLogicTest('List Service: reorderItem moves an item within a category', testReorderItemWithinCategory, SUITE_NAME, FILE_PATH),
        runLogicTest('List Service: reorderItem moves an item between categories', testReorderItemBetweenCategories, SUITE_NAME, FILE_PATH),
        runLogicTest('List Service: moveItemToCategory moves an item to another category in one mode', testMoveItemToCategory, SUITE_NAME, FILE_PATH),
        runLogicTest('List Service: addItem adds new items to the front of an existing Uncategorized category', testAddItemToFrontOfUncategorized, SUITE_NAME, FILE_PATH),
        runLogicTest('List Service: addItem creates a new Uncategorized category at the front if it does not exist', testAddItemCreatesUncategorizedCategoryFirst, SUITE_NAME, FILE_PATH),
        runLogicTest('List Service: move to shop "Remove from this view" should not delete item outright', testMoveToShopDeleteDoesNotDeleteItem, SUITE_NAME, FILE_PATH),
        runLogicTest('List Service: move to shop "Remove from this view" should delete item if already in home delete view', testMoveToShopDeleteDeletesItemIfInHomeDeleteView, SUITE_NAME, FILE_PATH),
        runLogicTest('List Service: move to home "Remove from this view" should delete item if already in shop delete view', testMoveToHomeDeleteDeletesItemIfInShopDeleteView, SUITE_NAME, FILE_PATH),
    ];
}