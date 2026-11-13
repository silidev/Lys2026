const FILE_PATH =
    'testing/suites/services/backupValidation.test.suite.ts';
import {
    isShoppingListItem,
    isShoppingListData,
    migrateFromSections,
} from '../../../common/services/backupService.ts';
import { runLogicTest } from '../../helpers.ts';
import {
    assertEquals,
} from '../../../common/testing/services/tests/helpers.ts';
import type {
    OldShoppingListDataWithSections,
} from '../../../types.ts';

const testItemValidationEdgeCases = () => {
    const fn = testItemValidationEdgeCases.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    assertEquals(
        isShoppingListItem({ id: '1', name: 'Milk', amount: 2 }),
        false,
        `${ctx}: numeric amount`
    );
    assertEquals(
        isShoppingListItem({
            id: '1',
            name: 'Milk',
            nameShop: 123,
        }),
        false,
        `${ctx}: numeric nameShop`
    );
    assertEquals(
        isShoppingListItem({
            id: '1',
            name: 'Milk',
            isUrgent: 'true',
        }),
        false,
        `${ctx}: string isUrgent`
    );
    assertEquals(
        isShoppingListItem({
            id: '1',
            name: 'Milk',
            nameShop: 'Dairy',
            isUrgent: true,
        }),
        true,
        `${ctx}: valid optional fields`
    );
};

const testDataValidationEdgeCases = () => {
    const fn = testDataValidationEdgeCases.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    assertEquals(
        isShoppingListData(null),
        false,
        `${ctx}: null`
    );
    assertEquals(
        isShoppingListData([]),
        false,
        `${ctx}: top-level array`
    );
    assertEquals(
        isShoppingListData({
            shopCategories: [],
            homeCategories: [],
        }),
        false,
        `${ctx}: missing items`
    );
    assertEquals(
        isShoppingListData({
            items: [{ bad: true }],
            shopCategories: [],
            homeCategories: [],
        }),
        false,
        `${ctx}: invalid item element`
    );
    assertEquals(
        isShoppingListData({
            items: [],
            shopSections: [],
            homeSections: [],
        }),
        true,
        `${ctx}: sections format`
    );
};

const testMigrateFromSections = () => {
    const fn = testMigrateFromSections.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    const legacy: OldShoppingListDataWithSections = {
        items: [{ id: 'i1', name: 'Apple', amount: '2' }],
        shopSections: [
            { id: 's1', name: 'Fruit', itemIds: ['i1'] },
        ],
        homeSections: [
            { id: 'h1', name: 'Kitchen', itemIds: ['i1'] },
        ],
    };
    const migrated = migrateFromSections(legacy);
    assertEquals(migrated.items, legacy.items, `${ctx}: items`);
    assertEquals(
        migrated.shopCategories,
        legacy.shopSections,
        `${ctx}: shopCategories`
    );
    assertEquals(
        migrated.homeCategories,
        legacy.homeSections,
        `${ctx}: homeCategories`
    );
};

export function backupValidationTestSuite() {
    const SUITE = backupValidationTestSuite.name;
    return [
        runLogicTest(
            'Backup Validation: item edge cases',
            testItemValidationEdgeCases,
            SUITE,
            FILE_PATH
        ),
        runLogicTest(
            'Backup Validation: data edge cases',
            testDataValidationEdgeCases,
            SUITE,
            FILE_PATH
        ),
        runLogicTest(
            'Backup Validation: migrateFromSections',
            testMigrateFromSections,
            SUITE,
            FILE_PATH
        ),
    ];
}
