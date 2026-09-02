const FILE_PATH = 'testing/suites/services/itemService.test.suite.ts';
import { runLogicTest } from '../../helpers.ts';
import * as itemService from '../../../common/services/itemService.ts';
import type { ShoppingListData, ShoppingListItem } from '../../../types.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';

const baseData: ShoppingListData = {
    items: [
        { id: '1', name: 'Milk' },
        { id: '2', name: 'Bread', amount: '0', defaultCompleted: true },
        { id: '3', name: 'Eggs', defaultCompleted: false },
    ],
    shopCategories: [],
    homeCategories: [],
};

const testUpdateAmountChangesAmount = () => {
    // baseData has Milk, with no amount. updateItemAmount will see current value as 1.
    const updatedData = itemService.updateItemAmount(baseData, '1', -1);
    const milk = updatedData.items.find(i => i.id === '1');
    assertEquals(!!milk, true, "Milk item should exist");
    assertEquals(milk?.amount, '0', "Item amount should be decremented to 0");

    // now milk's amount is '0'.
    const updatedData2 = itemService.updateItemAmount(updatedData, '1', 1);
    const milk2 = updatedData2.items.find(i => i.id === '1');
    assertEquals(!!milk2, true, "Milk item should exist after second update");
    assertEquals(milk2?.amount, '1', "Item amount should be incremented to 1");
};

const testToggleItemCompleted = () => {
    const data: ShoppingListData = { ...baseData, items: [{ id: '1', name: 'Milk' }] };
    // Toggle from incomplete (undefined amount) to complete
    let updatedData = itemService.toggleItemCompleted(data, '1');
    let milk = updatedData.items.find(i => i.id === '1');
    assertEquals(milk?.amount, '0', "Item should be completed");

    // Toggle from complete to incomplete
    updatedData = itemService.toggleItemCompleted(updatedData, '1');
    milk = updatedData.items.find(i => i.id === '1');
    assertEquals(milk?.amount, '1', "Item should be incomplete");
};

const testUpdateItem = () => {
    // Update name only
    let updatedData = itemService.updateItem(baseData, '1', { name: 'Skim Milk' });
    let milk = updatedData.items.find(i => i.id === '1');
    assertEquals(milk?.name, 'Skim Milk');
    assertEquals(milk?.amount, undefined);
    assertEquals(milk?.nameShop, undefined);

    // Update amount only
    updatedData = itemService.updateItem(baseData, '1', { amount: '1 liter' });
    milk = updatedData.items.find(i => i.id === '1');
    assertEquals(milk?.name, 'Milk');
    assertEquals(milk?.amount, '1 liter');
    assertEquals(milk?.nameShop, undefined);
    
    // Update shop name only
    updatedData = itemService.updateItem(baseData, '1', { nameShop: 'Shop Milk' });
    milk = updatedData.items.find(i => i.id === '1');
    assertEquals(milk?.name, 'Milk');
    assertEquals(milk?.amount, undefined);
    assertEquals(milk?.nameShop, 'Shop Milk');

    // Update all
    updatedData = itemService.updateItem(baseData, '1', { name: 'Organic Milk', amount: '2 liters', nameShop: 'Organic Shop Milk' });
    milk = updatedData.items.find(i => i.id === '1');
    assertEquals(milk?.name, 'Organic Milk');
    assertEquals(milk?.amount, '2 liters');
    assertEquals(milk?.nameShop, 'Organic Shop Milk');
};

const testResetPotentiallyUrgentItemsWhenUrgentModeIsInactive = () => {
    // Setup: make current state different from default
    const dataWithChanges: ShoppingListData = {
        ...baseData,
        items: [
            { id: '1', name: 'Milk', amount: '0', defaultCompleted: false }, // Often needed, Completed -> Should become '1'
            { id: '2', name: 'Bread', defaultCompleted: true }, // Seldom needed, Not completed -> Should not change
            { id: '3', name: 'Eggs', amount: '0' }, // Often needed (undef defaultCompleted), Completed -> Should become '1'
            { id: '4', name: 'Yogurt', amount: '0', defaultCompleted: true }, // Seldom needed, Completed -> Should remain '0'
            { id: '5', name: 'Coffee', amount: '5', defaultCompleted: false }, // Often needed, Incomplete (5) -> Should remain '5'
        ]
    };

    const resetData = itemService.resetPotentiallyUrgentItems(dataWithChanges, false);
    const milk = resetData.items.find(i => i.id === '1');
    const bread = resetData.items.find(i => i.id === '2');
    const eggs = resetData.items.find(i => i.id === '3');
    const yogurt = resetData.items.find(i => i.id === '4');
    const coffee = resetData.items.find(i => i.id === '5');

    assertEquals(!!(milk && bread && eggs && yogurt && coffee), true, "All items should exist after reset");
    assertEquals(milk?.amount, '1', "Milk (often needed, completed) should be reset to '1'");
    assertEquals(bread?.amount, undefined, "Bread (seldom needed, not completed) should remain unchecked (undefined)");
    assertEquals(eggs?.amount, '1', "Eggs (often needed, completed) should be reset to '1'");
    assertEquals(yogurt?.amount, '0', "Yogurt (seldom needed, completed) should remain completed ('0')");
    assertEquals(coffee?.amount, '5', "Coffee (often needed, incomplete) should keep its amount ('5')");
};

const testToggleDefaultCompleted = () => {
    const data: ShoppingListData = {
        items: [
            { id: '1', name: 'Item 1' }, // defaultCompleted is undefined
            { id: '2', name: 'Item 2', defaultCompleted: false },
            { id: '3', name: 'Item 3', defaultCompleted: true },
        ],
        shopCategories: [],
        homeCategories: [],
    };

    // Test undefined -> true
    let updatedData = itemService.toggleDefaultCompleted(data, '1');
    const item1 = updatedData.items.find(i => i.id === '1');
    assertEquals(item1?.defaultCompleted, true, "defaultCompleted should toggle from undefined to true");

    // Test false -> true
    updatedData = itemService.toggleDefaultCompleted(data, '2');
    const item2 = updatedData.items.find(i => i.id === '2');
    assertEquals(item2?.defaultCompleted, true, "defaultCompleted should toggle from false to true");

    // Test true -> false
    updatedData = itemService.toggleDefaultCompleted(data, '3');
    const item3 = updatedData.items.find(i => i.id === '3');
    assertEquals(item3?.defaultCompleted, false, "defaultCompleted should toggle from true to false");
};

const testResetPotentiallyUrgentItemsWhenUrgentModeIsActive = () => {
    const data: ShoppingListData = {
        items: [
            { id: '1', name: 'Milk', amount: '0', isRush: true }, // Urgent, Often needed, Completed -> Should become '1'
            { id: '2', name: 'Bread', amount: '0', isRush: false }, // Not urgent -> Should not change
            { id: '3', name: 'Eggs', amount: '1 dozen', isRush: true}, // Urgent, Not completed -> Should not change
            { id: '4', name: 'Juice', amount: '2L', isRush: false }, // Not urgent -> Should not change
            { id: '5', name: 'Yogurt', amount: '0', isRush: true, defaultCompleted: true }, // Urgent, Seldom needed, Completed -> Should stay '0'
        ],
        shopCategories: [], homeCategories: [],
    };

    const resetData = itemService.resetPotentiallyUrgentItems(data, true);

    const milk = resetData.items.find(i => i.id === '1');
    const bread = resetData.items.find(i => i.id === '2');
    const eggs = resetData.items.find(i => i.id === '3');
    const juice = resetData.items.find(i => i.id === '4');
    const yogurt = resetData.items.find(i => i.id === '5');

    // Assertions for urgent items
    assertEquals(milk?.amount, '1', 'Urgent item (Milk) should be reset to 1 because it was completed and is often needed');
    assertEquals(eggs?.amount, '1 dozen', 'Urgent item (Eggs) should keep amount because it was not completed');
    assertEquals(yogurt?.amount, '0', 'Urgent, defaultCompleted item (Yogurt) should remain completed');
    
    // Assertions for non-urgent items
    assertEquals(bread?.amount, '0', 'Non-urgent item (Bread) should not be reset');
    assertEquals(juice?.amount, '2L', 'Non-urgent item (Juice) should not be reset');
};

const testGetDisplayName = () => {
    const itemWithShopName: ShoppingListItem = { id: '1', name: 'Home Milk', nameShop: 'Shop Milk' };
    const itemWithoutShopName: ShoppingListItem = { id: '2', name: 'Home Bread' };
    const itemWithEmptyShopName: ShoppingListItem = { id: '3', name: 'Home Eggs', nameShop: '   ' };

    // Test with shop name
    assertEquals(itemService.getDisplayName(itemWithShopName, 'home'), 'Home Milk', 'Should return home name in home view');
    assertEquals(itemService.getDisplayName(itemWithShopName, 'shop'), 'Shop Milk', 'Should return shop name in shop view');

    // Test without shop name
    assertEquals(itemService.getDisplayName(itemWithoutShopName, 'home'), 'Home Bread', 'Should return home name in home view when no shop name');
    assertEquals(itemService.getDisplayName(itemWithoutShopName, 'shop'), 'Home Bread', 'Should return home name in shop view when no shop name');

    // Test with empty shop name
    assertEquals(itemService.getDisplayName(itemWithEmptyShopName, 'home'), 'Home Eggs', 'Should return home name in home view when shop name is empty');
    assertEquals(itemService.getDisplayName(itemWithEmptyShopName, 'shop'), 'Home Eggs', 'Should return home name in shop view when shop name is empty');
};

const testGetClipboardDisplayName = () => {
    const itemWithAmount: ShoppingListItem = { id: '1', name: 'Milk', amount: '2L' };
    const itemWithoutAmount: ShoppingListItem = { id: '2', name: 'Bread' };
    const itemWithShopName: ShoppingListItem = { id: '3', name: 'Home Flour', nameShop: 'Shop Flour', amount: '1kg' };
    const itemWithEmptyShopName: ShoppingListItem = { id: '4', name: 'Home Eggs', nameShop: ' ', amount: '12' };
    
    assertEquals(itemService.getClipboardDisplayName(itemWithAmount), '2L x Milk');
    assertEquals(itemService.getClipboardDisplayName(itemWithoutAmount), '1 x Bread');
    assertEquals(itemService.getClipboardDisplayName(itemWithShopName), '1kg x Shop Flour');
    assertEquals(itemService.getClipboardDisplayName(itemWithEmptyShopName), '12 x Home Eggs');
};

const testToggleHideUntilReset = () => {
    const data: ShoppingListData = {
        items: [
            { id: '1', name: 'Item 1' },
            { id: '2', name: 'Item 2', hideUntilReset: false },
            { id: '3', name: 'Item 3', hideUntilReset: true },
        ],
        shopCategories: [],
        homeCategories: [],
    };

    // Test undefined -> true
    let updatedData = itemService.toggleHideUntilReset(data, '1');
    const item1 = updatedData.items.find(i => i.id === '1');
    assertEquals(item1?.hideUntilReset, true, "hideUntilReset should toggle from undefined to true");

    // Test false -> true
    updatedData = itemService.toggleHideUntilReset(data, '2');
    const item2 = updatedData.items.find(i => i.id === '2');
    assertEquals(item2?.hideUntilReset, true, "hideUntilReset should toggle from false to true");

    // Test true -> false
    updatedData = itemService.toggleHideUntilReset(data, '3');
    const item3 = updatedData.items.find(i => i.id === '3');
    assertEquals(item3?.hideUntilReset, false, "hideUntilReset should toggle from true to false");
};

const testResetClearsHideUntilReset = () => {
    const dataWithFlag: ShoppingListData = {
        ...baseData,
        items: [
            { id: '1', name: 'Milk', hideUntilReset: true },
            { id: '2', name: 'Bread', amount: '0', defaultCompleted: true },
            { id: '3', name: 'Eggs', defaultCompleted: false, hideUntilReset: true },
        ]
    };

    // Test with isUrgentMode: false
    let resetData = itemService.resetPotentiallyUrgentItems(dataWithFlag, false);
    let milk = resetData.items.find(i => i.id === '1');
    let eggs = resetData.items.find(i => i.id === '3');
    assertEquals(milk?.hideUntilReset, false, "hideUntilReset should be cleared on reset (non-urgent mode)");
    assertEquals(eggs?.hideUntilReset, false, "hideUntilReset should be cleared on reset (non-urgent mode)");
    
    // Test with isUrgentMode: true
    resetData = itemService.resetPotentiallyUrgentItems(dataWithFlag, true);
    milk = resetData.items.find(i => i.id === '1');
    eggs = resetData.items.find(i => i.id === '3');
    assertEquals(milk?.hideUntilReset, false, "hideUntilReset should be cleared on reset (urgent mode)");
    assertEquals(eggs?.hideUntilReset, false, "hideUntilReset should be cleared on reset (urgent mode)");
};

export function itemServiceTestSuite() {
    const SUITE_NAME = itemServiceTestSuite.name;
    return [
        runLogicTest('Item Service: updateItemAmount changes the amount value', testUpdateAmountChangesAmount, SUITE_NAME, FILE_PATH),
        runLogicTest('Item Service: toggleItemCompleted toggles amount between "0" and "1"', testToggleItemCompleted, SUITE_NAME, FILE_PATH),
        runLogicTest('Item Service: updateItem changes the item properties', testUpdateItem, SUITE_NAME, FILE_PATH),
        runLogicTest('Item Service: reset (non-urgent) resets "Often needed" completed items to 1 and preserves others', testResetPotentiallyUrgentItemsWhenUrgentModeIsInactive, SUITE_NAME, FILE_PATH),
        runLogicTest('Item Service: toggleDefaultCompleted flips the defaultCompleted state', testToggleDefaultCompleted, SUITE_NAME, FILE_PATH),
        runLogicTest('Item Service: resetPotentiallyUrgentItems should only reset urgent items in urgent mode, following new quantity rules', testResetPotentiallyUrgentItemsWhenUrgentModeIsActive, SUITE_NAME, FILE_PATH),
        runLogicTest('Item Service: getDisplayName returns correct name based on view', testGetDisplayName, SUITE_NAME, FILE_PATH),
        runLogicTest('Item Service: getClipboardDisplayName returns correct string with amount prefix', testGetClipboardDisplayName, SUITE_NAME, FILE_PATH),
        runLogicTest('Item Service: toggleHideUntilReset flips the hideUntilReset state', testToggleHideUntilReset, SUITE_NAME, FILE_PATH),
        runLogicTest('Item Service: resetPotentiallyUrgentItems clears the hideUntilReset flag', testResetClearsHideUntilReset, SUITE_NAME, FILE_PATH),
    ];
}
