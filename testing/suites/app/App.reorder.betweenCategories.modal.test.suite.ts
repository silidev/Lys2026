



import React from 'react';
import { render } from '@testing-library/react';
import { screen, waitFor, within } from '@testing-library/dom';
import App from '../../../App.tsx';
import { runComponentTest, type User } from '../../helpers.ts';
import type { MockStorageService } from '../../mocks/storageService.mock.ts';
import type { ShoppingListData } from '../../../types.ts';
import { ensureShowCheckedItemsIsChecked } from '../../accessors.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { en } from '../../../localization/locales/en.ts';

const FILE_PATH = 'testing/suites/app/App.reorder.betweenCategories.modal.test.suite.ts';

const testMoveWithModal = async (user: User, mockStorage: MockStorageService) => {
    const initialData: ShoppingListData = {
        items: [{ id: '1', name: 'Milk', amount: '1' }],
        shopCategories: [
            { id: 's-fridge', name: 'Fridge', itemIds: ['1'] },
            { id: 's-veg', name: 'Vegetables', itemIds: [] }
        ],
        homeCategories: [],
    };
    mockStorage.setItem('shopping-list-data', initialData);
    const { container } = render(React.createElement(App));

    await ensureShowCheckedItemsIsChecked(user, container);

    const shopTab = container.querySelector<HTMLButtonElement>('#mode-tab-shop');
    assertEquals(!!shopTab, true, "Shop tab should exist");
    await user.click(shopTab!);

    const milkTextElement = within(container).getByText('Milk');
    const milkItemListItem = milkTextElement.closest('li')!;
    assertEquals(!!milkItemListItem, true, "Could not find list item for 'Milk'");

    await user.dblClick(milkTextElement);
    const editModal = await screen.findByRole('dialog', { name: en.itemEditModal.title });
    const moveButtonInModal = editModal.querySelector<HTMLButtonElement>('#select-shop-category-button');
    assertEquals(!!moveButtonInModal, true, "Move button in edit modal should exist");
    await user.click(moveButtonInModal!);
    
    const moveModal = await waitFor(() => document.querySelector('#move-item-modal'));
    assertEquals(!!moveModal, true, "Move item modal should exist");
    
    const vegButton = moveModal!.querySelector<HTMLButtonElement>('#move-item-to-category-s-veg-button');
    assertEquals(!!vegButton, true, "Vegetables category button in move modal should exist");
    await user.click(vegButton!);

    await waitFor(() => {
        const vegCategory = within(container).getByRole('heading', { name: 'Vegetables' }).closest('section');
        assertEquals(!!within(vegCategory!).getByText('Milk'), true, "Milk should be in Vegetables category");
    });

    const fridgeCategory = within(container).getByRole('heading', { name: 'Fridge' }).closest('section');
    assertEquals(within(fridgeCategory!).queryByText('Milk'), null, "Milk should not be in Fridge category");

    const storedData = mockStorage.getItem<ShoppingListData>('shopping-list-data');
    assertEquals(!!storedData, true, "Stored data should exist");
    if (storedData) {
        assertEquals(storedData.shopCategories[0].itemIds, [], "Fridge category should be empty"); // Fridge empty
        assertEquals(storedData.shopCategories[1].itemIds, ['1'], "Vegetables category should contain milk"); // Veg has milk
    }
};

export function appReorderBetweenCategoriesModalTestSuite() {
    const SUITE_NAME = appReorderBetweenCategoriesModalTestSuite.name;
    return [
        runComponentTest('App Reorder: should move an item to a different category via modal', testMoveWithModal, SUITE_NAME, FILE_PATH),
    ];
}