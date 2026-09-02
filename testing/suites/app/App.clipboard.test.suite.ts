const FILE_PATH = 'testing/suites/app/App.clipboard.test.suite.ts';
import React from 'react';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import App from '../../../App.tsx';
import { runComponentTest, type User } from '../../helpers.ts';
import type { MockStorageService } from '../../mocks/storageService.mock.ts';
import type { ShoppingListData } from '../../../types.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { en } from '../../../localization/locales/en.ts';

const testCopyMarkdownWithAmountPrefix = async (user: User, mockStorage: MockStorageService) => {
    const initialData: ShoppingListData = {
        items: [
            { id: '1', name: 'Milk', amount: '2' },
            { id: '2', name: 'Bread' }, // amount is undefined
            { id: '3', name: 'Eggs', amount: '1 dozen' },
            { id: '4', name: 'Flour', nameShop: 'Organic Flour', amount: '1kg'},
            { id: '5', name: 'Checked item', amount: '0' },
        ],
        shopCategories: [
            { id: 's1', name: 'Dairy', itemIds: ['1', '3', '5'] },
            { id: 's2', name: 'Bakery', itemIds: ['2', '4'] },
        ],
        homeCategories: [],
    };
    mockStorage.setItem('shopping-list-data', initialData);
    mockStorage.setItem('shopping-list-hide-completed', false); // show checked items
    mockStorage.setItem('shopping-list-advanced-mode', true); // ensure menu item is visible

    const { container } = render(React.createElement(App));
    
    const menuButton = container.querySelector('#header-menu-button');
    if (!menuButton) throw new Error('Menu button not found');
    await user.click(menuButton);
    
    const moreButton = await screen.findByRole('menuitem', { name: en.headerMenu.more });
    await user.click(moreButton);
    
    const copyMarkdownButton = await screen.findByRole('menuitem', { name: en.headerMenu.copyMarkdown });
    await user.click(copyMarkdownButton);

    await waitFor(async () => {
        const clipboardText = await navigator.clipboard.readText();
        const expectedText = `## Dairy
- [ ] 2 x Milk
- [ ] 1 dozen x Eggs
- [x] 0 x Checked item

## Bakery
- [ ] 1 x Bread
- [ ] 1kg x Organic Flour`;
        
        assertEquals(clipboardText.replace(/\r\n/g, '\n'), expectedText.replace(/\r\n/g, '\n'));
    });
};


const testCopyUncheckedWithAmountPrefix = async (user: User, mockStorage: MockStorageService) => {
    const initialData: ShoppingListData = {
        items: [
            { id: '1', name: 'Milk', amount: '2' },
            { id: '2', name: 'Bread' }, // amount is undefined
            { id: '3', name: 'Eggs', amount: '1 dozen' },
            { id: '4', name: 'Flour', nameShop: 'Organic Flour', amount: '1kg'},
            { id: '5', name: 'Checked item', amount: '0' },
        ],
        shopCategories: [
            { id: 's1', name: 'Dairy', itemIds: ['1', '3', '5'] },
            { id: 's2', name: 'Bakery', itemIds: ['2', '4'] },
        ],
        homeCategories: [],
    };
    mockStorage.setItem('shopping-list-data', initialData);
    mockStorage.setItem('shopping-list-advanced-mode', true); // ensure menu item is visible

    const { container } = render(React.createElement(App));
    
    const menuButton = container.querySelector('#header-menu-button');
    if (!menuButton) throw new Error('Menu button not found');
    await user.click(menuButton);
    
    const moreButton = await screen.findByRole('menuitem', { name: en.headerMenu.more });
    await user.click(moreButton);
    
    const copyUncheckedButton = await screen.findByRole('menuitem', { name: en.headerMenu.copyUnchecked });
    await user.click(copyUncheckedButton);

    await waitFor(async () => {
        const clipboardText = await navigator.clipboard.readText();
        const expectedText = `2 x Milk
1 dozen x Eggs
1 x Bread
1kg x Organic Flour`;

        const actualItems = clipboardText.split('\n').sort();
        const expectedItems = expectedText.split('\n').sort();
        assertEquals(actualItems, expectedItems);
    });
};


const testCopyMarkdownAllCombinations = async (user: User, mockStorage: MockStorageService) => {
    const items: ShoppingListItem[] = [];
    const itemIds: string[] = [];
    
    const amounts = [undefined, '0', '2'];
    const nameShops = [undefined, 'Shop Name'];
    const isRushes = [false, true];
    const isRushOnces = [false, true];
    const defaultCompleteds = [false, true];
    const hideUntilResets = [false, true];
    const aliases = [undefined, 'Alias'];
    const nameExports = [undefined, 'Export Name'];

    let idCounter = 1;

    for (const amount of amounts) {
        for (const nameShop of nameShops) {
            for (const isRush of isRushes) {
                for (const isRushOnce of isRushOnces) {
                    for (const defaultCompleted of defaultCompleteds) {
                        for (const hideUntilReset of hideUntilResets) {
                            for (const alias of aliases) {
                                for (const nameExport of nameExports) {
                                    const id = `item-${idCounter++}`;
                                    items.push({
                                        id,
                                        name: `Item ${id}`,
                                        amount,
                                        nameShop,
                                        isRush,
                                        isRushOnce,
                                        defaultCompleted,
                                        hideUntilReset,
                                        alias,
                                        nameExport
                                    });
                                    itemIds.push(id);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    const initialData: ShoppingListData = {
        items,
        shopCategories: [
            { id: 's1', name: 'All Items', itemIds },
        ],
        homeCategories: [],
    };
    mockStorage.setItem('shopping-list-data', initialData);
    mockStorage.setItem('shopping-list-hide-completed', false); // show checked items
    mockStorage.setItem('shopping-list-advanced-mode', true); // ensure menu item is visible

    const { container } = render(React.createElement(App));
    
    const menuButton = container.querySelector('#header-menu-button');
    if (!menuButton) throw new Error('Menu button not found');
    await user.click(menuButton);
    
    const moreButton = await screen.findByRole('menuitem', { name: en.headerMenu.more });
    await user.click(moreButton);
    
    const copyMarkdownButton = await screen.findByRole('menuitem', { name: en.headerMenu.copyMarkdown });
    await user.click(copyMarkdownButton);

    await waitFor(async () => {
        const clipboardText = await navigator.clipboard.readText();
        
        // Generate expected text
        const expectedItems = items
            .filter(item => !item.hideUntilReset)
            .map(item => {
                const checkbox = item.amount === '0' ? '[x]' : '[ ]';
                const displayName = item.nameExport && item.nameExport.trim() ? item.nameExport : (item.nameShop ? item.nameShop : item.name);
                const amt = (item.amount === null || item.amount === undefined || item.amount === '') ? '1' : item.amount;
                return `- ${checkbox} ${amt} x ${displayName}`;
            });
            
        const expectedText = `## All Items\n${expectedItems.join('\n')}`;
        
        assertEquals(clipboardText.replace(/\r\n/g, '\n'), expectedText.replace(/\r\n/g, '\n'));
    });
};

const testCopyUncheckedAllCombinations = async (user: User, mockStorage: MockStorageService) => {
    const items: ShoppingListItem[] = [];
    const itemIds: string[] = [];
    
    const amounts = [undefined, '0', '2'];
    const nameShops = [undefined, 'Shop Name'];
    const isRushes = [false, true];
    const isRushOnces = [false, true];
    const defaultCompleteds = [false, true];
    const hideUntilResets = [false, true];
    const aliases = [undefined, 'Alias'];
    const nameExports = [undefined, 'Export Name'];

    let idCounter = 1;

    for (const amount of amounts) {
        for (const nameShop of nameShops) {
            for (const isRush of isRushes) {
                for (const isRushOnce of isRushOnces) {
                    for (const defaultCompleted of defaultCompleteds) {
                        for (const hideUntilReset of hideUntilResets) {
                            for (const alias of aliases) {
                                for (const nameExport of nameExports) {
                                    const id = `item-${idCounter++}`;
                                    items.push({
                                        id,
                                        name: `Item ${id}`,
                                        amount,
                                        nameShop,
                                        isRush,
                                        isRushOnce,
                                        defaultCompleted,
                                        hideUntilReset,
                                        alias,
                                        nameExport
                                    });
                                    itemIds.push(id);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    const initialData: ShoppingListData = {
        items,
        shopCategories: [
            { id: 's1', name: 'All Items', itemIds },
        ],
        homeCategories: [],
    };
    mockStorage.setItem('shopping-list-data', initialData);
    mockStorage.setItem('shopping-list-advanced-mode', true); // ensure menu item is visible

    const { container } = render(React.createElement(App));
    
    const menuButton = container.querySelector('#header-menu-button');
    if (!menuButton) throw new Error('Menu button not found');
    await user.click(menuButton);
    
    const moreButton = await screen.findByRole('menuitem', { name: en.headerMenu.more });
    await user.click(moreButton);
    
    const copyUncheckedButton = await screen.findByRole('menuitem', { name: en.headerMenu.copyUnchecked });
    await user.click(copyUncheckedButton);

    await waitFor(async () => {
        const clipboardText = await navigator.clipboard.readText();
        
        // Generate expected text
        const expectedItems = items
            .filter(item => !item.hideUntilReset && item.amount !== '0')
            .map(item => {
                const displayName = item.nameExport && item.nameExport.trim() ? item.nameExport : (item.nameShop ? item.nameShop : item.name);
                const amt = (item.amount === null || item.amount === undefined || item.amount === '') ? '1' : item.amount;
                return `${amt} x ${displayName}`;
            });
            
        const expectedText = expectedItems.join('\n');
        
        const actualItems = clipboardText.split('\n').sort();
        const expectedItemsSorted = expectedText.split('\n').sort();
        assertEquals(actualItems, expectedItemsSorted);
    });
};

const testCopyMarkdownAllCombinationsHideCompleted = async (user: User, mockStorage: MockStorageService) => {
    const items: ShoppingListItem[] = [];
    const itemIds: string[] = [];
    
    const amounts = [undefined, '0', '2'];
    const nameShops = [undefined, 'Shop Name'];
    const isRushes = [false, true];
    const isRushOnces = [false, true];
    const defaultCompleteds = [false, true];
    const hideUntilResets = [false, true];
    const aliases = [undefined, 'Alias'];
    const nameExports = [undefined, 'Export Name'];

    let idCounter = 1;

    for (const amount of amounts) {
        for (const nameShop of nameShops) {
            for (const isRush of isRushes) {
                for (const isRushOnce of isRushOnces) {
                    for (const defaultCompleted of defaultCompleteds) {
                        for (const hideUntilReset of hideUntilResets) {
                            for (const alias of aliases) {
                                for (const nameExport of nameExports) {
                                    const id = `item-${idCounter++}`;
                                    items.push({
                                        id,
                                        name: `Item ${id}`,
                                        amount,
                                        nameShop,
                                        isRush,
                                        isRushOnce,
                                        defaultCompleted,
                                        hideUntilReset,
                                        alias,
                                        nameExport
                                    });
                                    itemIds.push(id);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    const initialData: ShoppingListData = {
        items,
        shopCategories: [
            { id: 's1', name: 'All Items', itemIds },
        ],
        homeCategories: [],
    };
    mockStorage.setItem('shopping-list-data', initialData);
    mockStorage.setItem('shopping-list-hide-completed', true); // hide checked items
    mockStorage.setItem('shopping-list-advanced-mode', true); // ensure menu item is visible

    const { container } = render(React.createElement(App));
    
    const menuButton = container.querySelector('#header-menu-button');
    if (!menuButton) throw new Error('Menu button not found');
    await user.click(menuButton);
    
    const moreButton = await screen.findByRole('menuitem', { name: en.headerMenu.more });
    await user.click(moreButton);
    
    const copyMarkdownButton = await screen.findByRole('menuitem', { name: en.headerMenu.copyMarkdown });
    await user.click(copyMarkdownButton);

    await waitFor(async () => {
        const clipboardText = await navigator.clipboard.readText();
        
        // Generate expected text
        const expectedItems = items
            .filter(item => !item.hideUntilReset && item.amount !== '0')
            .map(item => {
                const checkbox = item.amount === '0' ? '[x]' : '[ ]';
                const displayName = item.nameExport && item.nameExport.trim() ? item.nameExport : (item.nameShop ? item.nameShop : item.name);
                const amt = (item.amount === null || item.amount === undefined || item.amount === '') ? '1' : item.amount;
                return `- ${checkbox} ${amt} x ${displayName}`;
            });
            
        const expectedText = `## All Items\n${expectedItems.join('\n')}`;
        
        assertEquals(clipboardText.replace(/\r\n/g, '\n'), expectedText.replace(/\r\n/g, '\n'));
    });
};

export function appClipboardTestSuite() {
    const SUITE_NAME = appClipboardTestSuite.name;
    return [
        runComponentTest(
            'App Clipboard: should copy markdown with amount prefixes',
            testCopyMarkdownWithAmountPrefix,
            SUITE_NAME,
            FILE_PATH
        ),
        runComponentTest(
            'App Clipboard: should copy unchecked items with amount prefixes',
            testCopyUncheckedWithAmountPrefix,
            SUITE_NAME,
            FILE_PATH
        ),
        runComponentTest(
            'App Clipboard: should copy markdown with all combinations of item properties',
            testCopyMarkdownAllCombinations,
            SUITE_NAME,
            FILE_PATH
        ),
        runComponentTest(
            'App Clipboard: should copy markdown with all combinations of item properties (hide completed)',
            testCopyMarkdownAllCombinationsHideCompleted,
            SUITE_NAME,
            FILE_PATH
        ),
        runComponentTest(
            'App Clipboard: should copy unchecked items with all combinations of item properties',
            testCopyUncheckedAllCombinations,
            SUITE_NAME,
            FILE_PATH
        ),
    ];
}