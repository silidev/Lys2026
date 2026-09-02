

import { isShoppingListItem, isShoppingListData, migrateToCategories } from '../../../common/services/backupService.ts';
import { runLogicTest } from '../../helpers.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';

const FILE_PATH = 'testing/suites/services/backupService.test.suite.ts';

const testIsShoppingListItemValid = () => {
    const item = { id: '1', name: 'Milk', amount: '1' };
    assertEquals(isShoppingListItem(item), true);
};

const testIsShoppingListItemInvalid = () => {
    assertEquals(isShoppingListItem(null), false);
    assertEquals(isShoppingListItem({}), false);
    assertEquals(isShoppingListItem({ id: '1' }), false);
};

const testIsShoppingListDataValidNew = () => {
    const validNewFormat = { items: [], shopCategories: [], homeCategories: [] };
    assertEquals(isShoppingListData(validNewFormat), true);
};

const testIsShoppingListDataValidOld = () => {
    const validOldFormat = { items: [], shoppingOrder: [], homeOrder: [] };
    assertEquals(isShoppingListData(validOldFormat), true);
};

const testMigrateToCategories = () => {
    const oldData = {
        items: [{ id: '1', name: 'Milk' }],
        shoppingOrder: ['1'],
        homeOrder: ['1'],
    };
    const migrated = migrateToCategories(oldData);
    assertEquals(migrated.items, oldData.items);
    const uncategorizedShop = migrated.shopCategories.find(s => s.name === 'Uncategorized');
    assertEquals(!!uncategorizedShop, true, "Uncategorized shop category should exist");
    assertEquals(uncategorizedShop?.itemIds, ['1']);
};

export function backupServiceTestSuite() {
    const SUITE_NAME = backupServiceTestSuite.name;
    return [
        runLogicTest('Backup Service: isShoppingListItem returns true for valid item', testIsShoppingListItemValid, SUITE_NAME, FILE_PATH),
        runLogicTest('Backup Service: isShoppingListItem returns false for invalid item', testIsShoppingListItemInvalid, SUITE_NAME, FILE_PATH),
        runLogicTest('Backup Service: isShoppingListData returns true for valid new format', testIsShoppingListDataValidNew, SUITE_NAME, FILE_PATH),
        runLogicTest('Backup Service: isShoppingListData returns true for valid old format', testIsShoppingListDataValidOld, SUITE_NAME, FILE_PATH),
        runLogicTest('Backup Service: migrateToCategories migrates old data', testMigrateToCategories, SUITE_NAME, FILE_PATH),
    ];
}