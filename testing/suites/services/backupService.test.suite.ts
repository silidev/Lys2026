const FILE_PATH = 'testing/suites/services/backupService.test.suite.ts';
import {
    isShoppingListItem,
    isShoppingListData,
    migrateToCategories
} from '../../../common/services/backupService.ts';
import { runLogicTest } from '../../helpers.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import type { ShoppingListItem, ShoppingListData } from '../../../types.ts';
import { getVisibleCategories } from '../../../common/services/categoryService.ts';

const testIsShoppingListItemValid = () => {
    const item: ShoppingListItem = { id: '1', name: 'Milk', amount: '1' };
    assertEquals(isShoppingListItem(item), true, `${testIsShoppingListItemValid.name} in ${FILE_PATH}`);
};

const testIsShoppingListItemInvalid = () => {
    assertEquals(isShoppingListItem(null), false, `${testIsShoppingListItemInvalid.name} in ${FILE_PATH}`);
    assertEquals(isShoppingListItem({}), false, `${testIsShoppingListItemInvalid.name} in ${FILE_PATH}`);
    assertEquals(isShoppingListItem({ id: '1' }), false, `${testIsShoppingListItemInvalid.name} in ${FILE_PATH}`);
};

const testIsShoppingListDataValidNew = () => {
    const validNewFormat: ShoppingListData = { items: [], shopCategories: [], homeCategories: [] };
    assertEquals(isShoppingListData(validNewFormat), true, `${testIsShoppingListDataValidNew.name} in ${FILE_PATH}`);
};

const testIsShoppingListDataValidOld = () => {
    const validOldFormat = { items: [], shoppingOrder: [], homeOrder: [] };
    assertEquals(isShoppingListData(validOldFormat), true, `${testIsShoppingListDataValidOld.name} in ${FILE_PATH}`);
};

const testMigrateToCategories = () => {
    const oldData = {
        items: [{ id: '1', name: 'Milk' }],
        shoppingOrder: ['1'],
        homeOrder: ['1'],
    };
    const migrated = migrateToCategories(oldData);
    assertEquals(migrated.items, oldData.items, `${testMigrateToCategories.name} in ${FILE_PATH}`);
    const uncategorizedShop = migrated.shopCategories.find(s => s.name === 'Uncategorized');
    assertEquals(!!uncategorizedShop, true, `${testMigrateToCategories.name} in ${FILE_PATH}`);
    assertEquals(uncategorizedShop?.itemIds, ['1'], `${testMigrateToCategories.name} in ${FILE_PATH}`);
};

const testOneTimeItemPreservationInBackup = () => {
    const item: ShoppingListItem = {
        id: 'ot-1',
        name: 'Lightbulb',
        amount: '1',
        defaultCompleted: true,
        isUrgent: false,
        isUrgentOnce: false,
        hideUntilReset: false
    };
    assertEquals(isShoppingListItem(item), true, `${testOneTimeItemPreservationInBackup.name} item`);
    const backupData: ShoppingListData = {
        items: [item],
        shopCategories: [{ id: 's1', name: 'Pantry', itemIds: ['ot-1'] }],
        homeCategories: [{ id: 'h1', name: 'Pantry', itemIds: ['ot-1'] }]
    };
    assertEquals(isShoppingListData(backupData), true, `${testOneTimeItemPreservationInBackup.name} data`);
};

const testFilterDecouplingFromBackup = () => {
    // Confirmed user design: UI filters hide items in view,
    // but backup keeps them. Restoring to default filter
    // state reveals them.
    const item: ShoppingListItem = {
        id: 'ot-2',
        name: 'Special Battery',
        amount: '1',
        defaultCompleted: true,
        isUrgent: false
    };
    const itemMap = new Map([[item.id, item]]);
    const categories = [{ id: 'cat-1', name: 'Hardware', itemIds: [item.id] }];

    const visibleCats = getVisibleCategories(categories, itemMap, true);
    assertEquals(visibleCats[0]?.itemIds.includes('ot-2'), true, `${testFilterDecouplingFromBackup.name} visible`);

    const completedMap = new Map([[item.id, { ...item, amount: '0' }]]);
    const hiddenCats = getVisibleCategories(categories, completedMap, true);
    assertEquals(hiddenCats.length, 0, `${testFilterDecouplingFromBackup.name} hidden`);
};

export function backupServiceTestSuite() {
    const SUITE = backupServiceTestSuite.name;
    return [
        runLogicTest('isShoppingListItem returns true for valid', testIsShoppingListItemValid, SUITE, FILE_PATH),
        runLogicTest('isShoppingListItem returns false for invalid', testIsShoppingListItemInvalid, SUITE, FILE_PATH),
        runLogicTest('isShoppingListItem returns false for invalid', testIsShoppingListItemInvalid, SUITE, FILE_PATH),
        runLogicTest('isShoppingListData returns true for valid new', testIsShoppingListDataValidNew, SUITE, FILE_PATH),
        runLogicTest('isShoppingListData returns true for valid old', testIsShoppingListDataValidOld, SUITE, FILE_PATH),
        runLogicTest('migrateToCategories migrates old data', testMigrateToCategories, SUITE, FILE_PATH),
        runLogicTest('one-time items validate cleanly in backup', testOneTimeItemPreservationInBackup, SUITE, FILE_PATH),
        runLogicTest('filter decoupling preserves items on restore', testFilterDecouplingFromBackup, SUITE, FILE_PATH),
    ];
}