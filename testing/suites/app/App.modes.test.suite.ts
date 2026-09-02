import React from 'react';
import { render } from '@testing-library/react';
import { waitFor, within } from '@testing-library/dom';
import App from '../../../App.tsx';
import { runComponentTest, type User } from '../../helpers.ts';
import { ensureShowCheckedItemsIsChecked } from '../../accessors.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import type { MockStorageService } from '../../mocks/storageService.mock.ts';
import type { ShoppingListData } from '../../../types.ts';

const FILE_PATH = 'testing/suites/app/App.modes.test.suite.ts';

const testModeSwitching = async (user: User, mockStorage: MockStorageService) => {
    // Create custom data to ensure categories are unique to each mode
    // This avoids relying on default data which might not be suitable for this test.
    const testData: ShoppingListData = {
        items: [
            { id: 'item-home', name: 'Home Item', amount: '1' },
            { id: 'item-shop', name: 'Shop Item', amount: '1' },
        ],
        shopCategories: [
            { id: 'shop-only-sec', name: 'Shop-Only Category', itemIds: ['item-shop'] }
        ],
        homeCategories: [
            { id: 'home-only-sec', name: 'Home-Only Category', itemIds: ['item-home'] }
        ]
    };
    mockStorage.setItem('shopping-list-data', testData);
    
    const { container } = render(React.createElement(App));

    await ensureShowCheckedItemsIsChecked(user, container);

    // Home mode is default, should have home-specific categories.
    await waitFor(() => {
        assertEquals(!!within(container).getByRole('heading', { name: 'Home-Only Category' }), true, 'Home-Only Category should be visible in home mode');
    });
    assertEquals(within(container).queryByRole('heading', { name: 'Shop-Only Category' }), null, 'Shop-Only Category should not be visible in home mode');

    // Switch to Shop mode
    const shopTab = container.querySelector<HTMLButtonElement>('#mode-tab-shop');
    assertEquals(!!shopTab, true, "Shop tab button should exist");
    await user.click(shopTab!);
    
    // Shop mode should have shop-specific categories
    await waitFor(() => {
      assertEquals(!!within(container).getByRole('heading', { name: 'Shop-Only Category' }), true, 'Shop-Only Category should be visible in shop mode');
    });
    assertEquals(within(container).queryByRole('heading', { name: 'Home-Only Category' }), null, 'Home-Only Category should not be visible in shop mode');

    // Switch back to Home mode
    const homeTab = container.querySelector<HTMLButtonElement>('#mode-tab-home');
    assertEquals(!!homeTab, true, "Home tab button should exist");
    await user.click(homeTab!);

    await waitFor(() => {
        assertEquals(!!within(container).getByRole('heading', { name: 'Home-Only Category' }), true, 'Home-Only Category should be visible after switching back to home mode');
    });
    assertEquals(within(container).queryByRole('heading', { name: 'Shop-Only Category' }), null, 'Shop-Only Category should not be visible after switching back to home mode');
};

export function appModesTestSuite() {
    const SUITE_NAME = appModesTestSuite.name;
    return [
        runComponentTest('App Modes: should switch modes and show mode-specific categories', testModeSwitching, SUITE_NAME, FILE_PATH),
    ];
}