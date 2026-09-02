const FILE_PATH = 'testing/suites/services/categoryService.test.suite.ts';
import { runLogicTest } from '../../helpers.ts';
import { getVisibleCategories, reorderCategory, updateCategoryName, getManageableCategories } from '../../../common/services/categoryService.ts';
import type { ShoppingListItem, Category, ShoppingListData } from '../../../types.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { REMOVE_FROM_VIEW_CATEGORY_NAME } from '../../../00configs/app.ts';

const items: ShoppingListItem[] = [
    { id: '1', name: 'Completed Item 1', amount: '0' },
    { id: '2', name: 'Completed Item 2', amount: '0' },
    { id: '3', name: 'Incomplete Item 1' },
    { id: '4', name: 'Completed Item 3', amount: '0' },
    { id: '5', name: 'Incomplete Item 2' },
];
const itemMap = new Map(items.map(i => [i.id, i]));

const categories: Category[] = [
    { id: 's1', name: 'All Completed', itemIds: ['1', '2'] },
    { id: 's2', name: 'Mixed', itemIds: ['3', '4'] },
    { id: 's3', name: 'All Incomplete', itemIds: ['5'] },
    { id: 's4', name: 'Empty', itemIds: [] },
];

const testHidesCompletedCategories = () => {
    const visibleCategories = getVisibleCategories(categories, itemMap, true);
    const visibleCategoryNames = visibleCategories.map(s => s.name);

    assertEquals(visibleCategoryNames.includes('All Completed'), false);
    assertEquals(visibleCategoryNames.includes('Mixed'), true);
    assertEquals(visibleCategoryNames.includes('All Incomplete'), true);
    assertEquals(visibleCategoryNames.includes('Empty'), false);
    assertEquals(visibleCategories.length, 2);
};

const testShowsAllCategoriesWhenNotHidingCompleted = () => {
    const visibleCategories = getVisibleCategories(categories, itemMap, false);
    const visibleCategoryNames = visibleCategories.map(s => s.name);

    assertEquals(visibleCategoryNames.includes('All Completed'), true);
    assertEquals(visibleCategoryNames.includes('Mixed'), true);
    assertEquals(visibleCategoryNames.includes('All Incomplete'), true);
    assertEquals(visibleCategoryNames.includes('Empty'), true);
    assertEquals(visibleCategories.length, 4);
};

const getReorderBaseData = (): ShoppingListData => ({
    items: [],
    shopCategories: [
        { id: 's1', name: 'A', itemIds: [] },
        { id: 's2', name: 'B', itemIds: [] },
        { id: 's3', name: 'C', itemIds: [] },
        { id: 's4', name: 'D', itemIds: [] },
    ],
    homeCategories: [],
});

const testReorderCategoryDown = () => {
    const data = getReorderBaseData();
    const sourceIndex = 1; // Category B
    const destinationIndex = 3; // Drop on Category D

    const updatedData = reorderCategory(data, sourceIndex, destinationIndex, 'shop');
    const newCategoryOrder = updatedData.shopCategories.map(s => s.name);

    // Expected: [A, C, B, D] - B is moved to be *before* D
    // The bug causes: [A, C, D, B]
    assertEquals(newCategoryOrder, ['A', 'C', 'B', 'D']);
};

const testReorderCategoryUp = () => {
    const data = getReorderBaseData();
    const sourceIndex = 2; // Category C
    const destinationIndex = 0; // Drop on Category A

    const updatedData = reorderCategory(data, sourceIndex, destinationIndex, 'shop');
    const newCategoryOrder = updatedData.shopCategories.map(s => s.name);

    // Expected: [C, A, B, D]
    assertEquals(newCategoryOrder, ['C', 'A', 'B', 'D']);
};

const getUpdateNameBaseData = (): ShoppingListData => ({
    items: [],
    shopCategories: [
        { id: 's1', name: 'Normal', itemIds: [] },
        { id: 's2', name: 'Uncategorized', itemIds: [] },
        { id: 's4', name: 'Another Normal', itemIds: [] },
    ],
    homeCategories: [],
});

const testDoesNotRenameUncategorizedCategory = () => {
    const data = getUpdateNameBaseData();
    const updatedData = updateCategoryName(data, 's2', 'New Name', 'shop');
    const category = updatedData.shopCategories.find(s => s.id === 's2');
    assertEquals(category?.name, 'Uncategorized', "Uncategorized category should not be renamed.");
};

const testRenamesNormalCategory = () => {
    const data = getUpdateNameBaseData();
    const updatedData = updateCategoryName(data, 's1', 'New Name', 'shop');
    const category = updatedData.shopCategories.find(s => s.id === 's1');
    assertEquals(category?.name, 'New Name', "Normal category should be renamed.");
};

const testAlwaysHidesRemovedFromListCategory = () => {
    const testItems: ShoppingListItem[] = [
        { id: 'i1', name: 'Incomplete A' },
        { id: 'i2', name: 'Completed B', amount: '0' },
    ];
    const testItemMap = new Map(testItems.map(i => [i.id, i]));
    const testCategories: Category[] = [
        { id: 'sA', name: 'Normal Category', itemIds: ['i1'] },
        { id: 'sB', name: REMOVE_FROM_VIEW_CATEGORY_NAME, itemIds: ['i2'] },
    ];

    // Case 1: hideCompleted is true
    const visibleWhenHiding = getVisibleCategories(testCategories, testItemMap, true);
    let visibleNames = visibleWhenHiding.map(s => s.name);
    assertEquals(visibleNames.includes('Normal Category'), true, "Normal Category should be visible when hiding completed");
    assertEquals(visibleNames.includes(REMOVE_FROM_VIEW_CATEGORY_NAME), false, `'${REMOVE_FROM_VIEW_CATEGORY_NAME}' category should NOT be visible when hiding completed`);
    assertEquals(visibleWhenHiding.length, 1);

    // Case 2: hideCompleted is false
    const visibleWhenNotHiding = getVisibleCategories(testCategories, testItemMap, false);
    visibleNames = visibleWhenNotHiding.map(s => s.name);
    assertEquals(visibleNames.includes('Normal Category'), true, "Normal Category should be visible when showing completed");
    assertEquals(visibleNames.includes(REMOVE_FROM_VIEW_CATEGORY_NAME), false, `'${REMOVE_FROM_VIEW_CATEGORY_NAME}' category should NOT be visible when showing completed`);
    assertEquals(visibleWhenNotHiding.length, 1);
};

const testFiltersRemovedFromListForManagement = () => {
    const testCategories: Category[] = [
        { id: 'sA', name: 'Normal Category', itemIds: [] },
        { id: 'sB', name: REMOVE_FROM_VIEW_CATEGORY_NAME, itemIds: [] },
        { id: 'sC', name: 'Uncategorized', itemIds: [] },
    ];

    const manageableCategories = getManageableCategories(testCategories);
    
    const names = manageableCategories.map(s => s.name);

    assertEquals(names.includes('Normal Category'), true, "Manageable categories should include 'Normal Category'");
    assertEquals(names.includes(REMOVE_FROM_VIEW_CATEGORY_NAME), false, `Manageable categories should NOT include '${REMOVE_FROM_VIEW_CATEGORY_NAME}'`);
    assertEquals(names.includes('Uncategorized'), true, "Manageable categories should include 'Uncategorized'");
    assertEquals(manageableCategories.length, 2);
};

const testReorderLastManageableCategoryUp = () => {
    const data: ShoppingListData = {
        items: [],
        shopCategories: [
            { id: 's1', name: 'A', itemIds: [] },
            { id: 's2', name: REMOVE_FROM_VIEW_CATEGORY_NAME, itemIds: [] },
            { id: 's3', name: 'B', itemIds: [] },
            { id: 's4', name: 'C', itemIds: [] },
        ],
        homeCategories: [],
    };
    // Manageable categories are [A, B, C] at indices 0, 1, 2
    // C is the last one. User clicks up.
    // In CategoryManager, this is index 2. `handleMoveUp` calls onReorder(2, 1).
    const sourceIndexFromUI = 2; // for C
    const destinationIndexFromUI = 1; // to be before B

    const updatedData = reorderCategory(data, sourceIndexFromUI, destinationIndexFromUI, 'shop');
    const newCategoryOrder = updatedData.shopCategories.map(s => s.name);
    
    // The bug is that reorderCategory receives indices from the filtered list (manageable)
    // but operates on the full list.
    // Full list: [A, REMOVE, B, C]. 
    // `sourceIndexFromUI` 2 corresponds to `B` in the full list.
    // `destinationIndexFromUI` 1 corresponds to `REMOVE`.
    // The buggy logic will move B before REMOVE, resulting in [A, B, REMOVE, C].
    // The correct behavior should move C before B, resulting in [A, REMOVE, C, B].
    assertEquals(newCategoryOrder, ['A', REMOVE_FROM_VIEW_CATEGORY_NAME, 'C', 'B']);
};

const testHidesItemsWithHideUntilResetFlag = () => {
    const testItems: ShoppingListItem[] = [
        { id: 'i1', name: 'Normal Item' },
        { id: 'i2', name: 'Hidden Item', hideUntilReset: true },
        { id: 'i3', name: 'Completed Hidden Item', hideUntilReset: true, amount: '0' },
    ];
    const testItemMap = new Map(testItems.map(i => [i.id, i]));
    const testCategories: Category[] = [
        { id: 'sA', name: 'Category A', itemIds: ['i1', 'i2', 'i3'] },
    ];

    // Case 1: hideCompleted is false
    let visibleCategories = getVisibleCategories(testCategories, testItemMap, false);
    assertEquals(visibleCategories.length, 1, "Category should still be visible");
    assertEquals(visibleCategories[0].itemIds.length, 1, "Only one item should be visible when not hiding completed");
    assertEquals(visibleCategories[0].itemIds[0], 'i1');

    // Case 2: hideCompleted is true
    visibleCategories = getVisibleCategories(testCategories, testItemMap, true);
    assertEquals(visibleCategories.length, 1, "Category should still be visible when hiding completed");
    assertEquals(visibleCategories[0].itemIds.length, 1, "Only one item should be visible when hiding completed");
    assertEquals(visibleCategories[0].itemIds[0], 'i1');
};

export function categoryServiceTestSuite() {
    const SUITE_NAME = categoryServiceTestSuite.name;
    return [
        runLogicTest(
            'Category Service: getVisibleCategories should hide categories with only completed items when hiding completed',
            testHidesCompletedCategories,
            SUITE_NAME,
            FILE_PATH
        ),
        runLogicTest(
            'Category Service: getVisibleCategories should show all categories when not hiding completed',
            testShowsAllCategoriesWhenNotHidingCompleted,
            SUITE_NAME,
            FILE_PATH
        ),
        runLogicTest(
            'Category Service: reorderCategory should correctly move a category down',
            testReorderCategoryDown,
            SUITE_NAME,
            FILE_PATH
        ),
        runLogicTest(
            'Category Service: reorderCategory should correctly move a category up',
            testReorderCategoryUp,
            SUITE_NAME,
            FILE_PATH
        ),
        runLogicTest(
            'Category Service: updateCategoryName should not rename Uncategorized category',
            testDoesNotRenameUncategorizedCategory,
            SUITE_NAME,
            FILE_PATH
        ),
        runLogicTest(
            'Category Service: updateCategoryName should rename a normal category',
            testRenamesNormalCategory,
            SUITE_NAME,
            FILE_PATH
        ),
        runLogicTest(
            'Category Service: getVisibleCategories should always hide "Remove from this view" category',
            testAlwaysHidesRemovedFromListCategory,
            SUITE_NAME,
            FILE_PATH
        ),
        runLogicTest(
            'Category Service: getManageableCategories should filter out "Remove from this view" categories',
            testFiltersRemovedFromListForManagement,
            SUITE_NAME,
            FILE_PATH
        ),
        runLogicTest(
            'Category Service: reorder should fail for last manageable category when hidden category is present',
            testReorderLastManageableCategoryUp,
            SUITE_NAME,
            FILE_PATH
        ),
        runLogicTest(
            'Category Service: getVisibleCategories should hide items with hideUntilReset flag',
            testHidesItemsWithHideUntilResetFlag,
            SUITE_NAME,
            FILE_PATH
        ),
    ];
}