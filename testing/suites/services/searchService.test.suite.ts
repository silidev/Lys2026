const FILE_PATH = 'testing/suites/services/searchService.test.suite.ts';
import { runLogicTest } from '../../helpers.ts';
import { filterVisibleCategories } from '../../../common/services/searchService.ts';
import type { ShoppingListItem, Category } from '../../../types.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { REMOVE_FROM_VIEW_CATEGORY_NAME } from '../../../00configs/app.ts';

const items: ShoppingListItem[] = [
    { id: '1', name: 'Apples' },
    { id: '2', name: 'Apple Juice', amount: '0' },
    { id: '3', name: 'Bananas' },
    { id: '4', name: 'Milk' },
    { id: '5', name: 'Whole Milk', amount: '0' },
    { id: '6', name: 'Toothpaste', alias: 'Dental Hygiene' }, // Item with alias
];
const itemMap = new Map(items.map(i => [i.id, i]));

const categories: Category[] = [
    { id: 's1', name: 'Fruit', itemIds: ['1', '2', '3'] },
    { id: 's2', name: 'Dairy', itemIds: ['4', '5'] },
    { id: 's3', name: 'Empty', itemIds: [] },
    { id: 's4', name: 'Bathroom', itemIds: ['6'] },
];

const testEmptySearchTerm = () => {
    const result = filterVisibleCategories(categories, itemMap, '');
    assertEquals(result.length, 4);
};

const testSimpleFilter = () => {
    const result = filterVisibleCategories(categories, itemMap, 'banana');
    assertEquals(result.length, 1);
    assertEquals(result[0].name, 'Fruit');
    assertEquals(result[0].itemIds, ['3']);
};

const testCaseInsensitiveFilter = () => {
    const result = filterVisibleCategories(categories, itemMap, 'APPLE');
    assertEquals(result.length, 1);
    assertEquals(result[0].name, 'Fruit');
    assertEquals(result[0].itemIds.sort(), ['1', '2']);
};

const testFilterIncludesCompleted = () => {
    const result = filterVisibleCategories(categories, itemMap, 'milk');
    assertEquals(result.length, 1);
    assertEquals(result[0].name, 'Dairy');
    assertEquals(result[0].itemIds.sort(), ['4', '5']); // Includes completed 'Whole Milk'
};

const testHidesEmptyCategories = () => {
    const result = filterVisibleCategories(categories, itemMap, 'juice');
    assertEquals(result.length, 1);
    const categoryNames = result.map(s => s.name);
    assertEquals(categoryNames.includes('Dairy'), false, "Dairy category should be hidden");
    assertEquals(categoryNames.includes('Fruit'), true, "Fruit category should be visible");
};

const testNoMatches = () => {
    const result = filterVisibleCategories(categories, itemMap, 'xyz');
    assertEquals(result, [], 'Should return an empty array for no matches');
};

const testMultipleMatchesAcrossCategories = () => {
    const localItems: ShoppingListItem[] = [
        { id: '1', name: 'Green Apples' },
        { id: '2', name: 'Green Beans' },
    ];
    const localItemMap = new Map(localItems.map(i => [i.id, i]));
    const localCategories: Category[] = [
        { id: 's1', name: 'Fruit', itemIds: ['1'] },
        { id: 's2', name: 'Veggies', itemIds: ['2'] },
    ];

    const result = filterVisibleCategories(localCategories, localItemMap, 'green');
    assertEquals(result.length, 2);
    assertEquals(result[0].name, 'Fruit');
    assertEquals(result[0].itemIds, ['1']);
    assertEquals(result[1].name, 'Veggies');
    assertEquals(result[1].itemIds, ['2']);
};

const testFilterHidesRemovedItemsWhenNotSearching = () => {
    const localItems: ShoppingListItem[] = [
        { id: '1', name: 'Searchable in normal' },
        { id: '2', name: 'Searchable in removed' },
    ];
    const localItemMap = new Map(localItems.map(i => [i.id, i]));
    const localCategories: Category[] = [
        { id: 's1', name: 'Normal Category', itemIds: ['1'] },
        { id: 's2', name: REMOVE_FROM_VIEW_CATEGORY_NAME, itemIds: ['2'] },
    ];

    // Pass an empty search term to test the "not searching" behavior.
    const result = filterVisibleCategories(localCategories, localItemMap, '');
    assertEquals(result.length, 1, "Should only return one category when not searching.");
    assertEquals(result[0].name, 'Normal Category', "The normal category should be visible.");
    assertEquals(result[0].itemIds.length, 1, "Normal category should have its item.");
    assertEquals(result[0].itemIds[0], '1');
};

const testFilterIncludesRemovedItemsWhenSearching = () => {
    const localItems: ShoppingListItem[] = [
        { id: '1', name: 'Searchable in normal' },
        { id: '2', name: 'Searchable in removed' },
        { id: '3', name: 'Another normal' },
    ];
    const localItemMap = new Map(localItems.map(i => [i.id, i]));
    const localCategories: Category[] = [
        { id: 's1', name: 'Normal Category', itemIds: ['1', '3'] },
        { id: 's2', name: REMOVE_FROM_VIEW_CATEGORY_NAME, itemIds: ['2'] },
    ];

    const result = filterVisibleCategories(localCategories, localItemMap, 'Searchable');

    assertEquals(result.length, 2, "Should return two categories when search term matches items in both.");
    
    const normalCategoryResult = result.find(s => s.id === 's1');
    const removedCategoryResult = result.find(s => s.id === 's2');

    assertEquals(!!normalCategoryResult, true, "Normal category with match should be in results.");
    assertEquals(normalCategoryResult?.itemIds.length, 1);
    assertEquals(normalCategoryResult?.itemIds[0], '1');

    assertEquals(!!removedCategoryResult, true, "'Remove from this view' category should be in results when an item matches search.");
    assertEquals(removedCategoryResult?.itemIds.length, 1);
    assertEquals(removedCategoryResult?.itemIds[0], '2');
};

const testSearchByAlias = () => {
    const result = filterVisibleCategories(categories, itemMap, 'dental');
    assertEquals(result.length, 1);
    assertEquals(result[0].name, 'Bathroom');
    assertEquals(result[0].itemIds, ['6'], "Should find 'Toothpaste' by searching for its alias 'dental'");
};


export function searchServiceTestSuite() {
    const SUITE_NAME = searchServiceTestSuite.name;
    return [
        runLogicTest('Search Service: returns all categories for empty search term', testEmptySearchTerm, SUITE_NAME, FILE_PATH),
        runLogicTest('Search Service: filters items based on search term', testSimpleFilter, SUITE_NAME, FILE_PATH),
        runLogicTest('Search Service: filter is case-insensitive', testCaseInsensitiveFilter, SUITE_NAME, FILE_PATH),
        runLogicTest('Search Service: includes completed items in search results', testFilterIncludesCompleted, SUITE_NAME, FILE_PATH),
        runLogicTest('Search Service: hides categories that become empty after filtering', testHidesEmptyCategories, SUITE_NAME, FILE_PATH),
        runLogicTest('Search Service: returns an empty array for no matches', testNoMatches, SUITE_NAME, FILE_PATH),
        runLogicTest('Search Service: handles matches across multiple categories', testMultipleMatchesAcrossCategories, SUITE_NAME, FILE_PATH),
        runLogicTest('Search Service: hides "Remove from this view" category when not searching', testFilterHidesRemovedItemsWhenNotSearching, SUITE_NAME, FILE_PATH),
        runLogicTest('Search Service: includes "Remove from this view" items when searching', testFilterIncludesRemovedItemsWhenSearching, SUITE_NAME, FILE_PATH),
        runLogicTest('Search Service: finds items by alias', testSearchByAlias, SUITE_NAME, FILE_PATH),
    ];
}