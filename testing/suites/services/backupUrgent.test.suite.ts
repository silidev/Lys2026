const FILE_PATH =
    'testing/suites/services/backupUrgent.test.suite.ts';
import {
    isShoppingListData,
    migrateFromSections,
    migrateToCategories,
} from '../../../common/services/backupService.ts';
import { runLogicTest } from '../../helpers.ts';
import {
    assertEquals,
} from '../../../common/testing/services/tests/helpers.ts';
import type {
    OldShoppingListDataWithOrder,
    OldShoppingListDataWithSections,
    ShoppingListData,
    ShoppingListItem,
} from '../../../types.ts';
import { assertItemUrgentFlags } from './backupTestHelpers.ts';

const testUrgentFlagsRoundTripInBackup = () => {
    const fn = testUrgentFlagsRoundTripInBackup.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    const original: ShoppingListData = {
        items: [
            {
                id: 'u1',
                name: 'Urgent Always',
                amount: '1',
                isUrgent: true,
                isUrgentOnce: false,
            },
            {
                id: 'u2',
                name: 'Urgent Once',
                amount: '1',
                isUrgent: false,
                isUrgentOnce: true,
            },
            {
                id: 'u3',
                name: 'Both Urgent',
                amount: '2',
                isUrgent: true,
                isUrgentOnce: true,
            },
            { id: 'u4', name: 'Unset Urgent', amount: '1' },
        ],
        shopCategories: [
            {
                id: 's1',
                name: 'Fridge',
                itemIds: ['u1', 'u2', 'u3', 'u4'],
            },
        ],
        homeCategories: [
            {
                id: 'h1',
                name: 'Pantry',
                itemIds: ['u1', 'u2', 'u3', 'u4'],
            },
        ],
    };

    const json = JSON.stringify(original, null, 2);
    const parsed = JSON.parse(json) as ShoppingListData;

    assertEquals(isShoppingListData(parsed), true, ctx);
    assertEquals(parsed.items.length, 4, ctx);

    const byId = new Map(parsed.items.map(i => [i.id, i]));
    assertItemUrgentFlags(byId.get('u1'), true, false, ctx);
    assertItemUrgentFlags(byId.get('u2'), false, true, ctx);
    assertItemUrgentFlags(byId.get('u3'), true, true, ctx);
    assertItemUrgentFlags(
        byId.get('u4'),
        undefined,
        undefined,
        ctx
    );
};

const testLegacyMigrationsPreserveUrgentFlags = () => {
    const fn = testLegacyMigrationsPreserveUrgentFlags.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    const legacyItems: ShoppingListItem[] = [
        {
            id: 'm1',
            name: 'Milk',
            isUrgent: true,
            isUrgentOnce: false,
        },
        {
            id: 'm2',
            name: 'Bread',
            isUrgent: false,
            isUrgentOnce: true,
        },
    ];

    const sectionsInput: OldShoppingListDataWithSections = {
        items: legacyItems,
        shopSections: [
            { id: 's1', name: 'Dairy', itemIds: ['m1', 'm2'] },
        ],
        homeSections: [
            { id: 'h1', name: 'Fridge', itemIds: ['m1', 'm2'] },
        ],
    };
    const fromSections = migrateFromSections(sectionsInput);
    assertItemUrgentFlags(
        fromSections.items[0],
        true,
        false,
        `${ctx} (sections)`
    );
    assertItemUrgentFlags(
        fromSections.items[1],
        false,
        true,
        `${ctx} (sections)`
    );

    const orderInput: OldShoppingListDataWithOrder = {
        items: legacyItems,
        shoppingOrder: ['m1', 'm2'],
        homeOrder: ['m1', 'm2'],
    };
    const fromOrder = migrateToCategories(orderInput);
    assertItemUrgentFlags(
        fromOrder.items[0],
        true,
        false,
        `${ctx} (order)`
    );
    assertItemUrgentFlags(
        fromOrder.items[1],
        false,
        true,
        `${ctx} (order)`
    );
};

export function backupUrgentTestSuite() {
    const SUITE = backupUrgentTestSuite.name;
    return [
        runLogicTest(
            'JSON backup round-trip preserves urgent flags',
            testUrgentFlagsRoundTripInBackup,
            SUITE,
            FILE_PATH
        ),
        runLogicTest(
            'Legacy migrations preserve urgent flags',
            testLegacyMigrationsPreserveUrgentFlags,
            SUITE,
            FILE_PATH
        ),
    ];
}
