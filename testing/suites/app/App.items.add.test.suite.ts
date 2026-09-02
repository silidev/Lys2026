const FILE_PATH = 'testing/suites/app/App.items.add.test.suite.ts';
import React from 'react';
import { render } from '@testing-library/react';
import { waitFor, within, screen } from '@testing-library/dom';
import App from '../../../App.tsx';
import { runComponentTest, type User } from '../../helpers.ts';
import type { MockStorageService } from '../../mocks/storageService.mock.ts';
import { ensureShowCheckedItemsIsChecked } from '../../accessors.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { en } from '../../../localization/locales/en.ts';

const testAddToggleDelete = async (user: User, mockStorage: MockStorageService) => {
    const emptyData = { items: [], shopCategories: [{id: 'uncategorized', name: 'Uncategorized', itemIds:[]}], homeCategories: [{id: 'uncategorized', name: 'Uncategorized', itemIds:[]}] };
    mockStorage.setItem('shopping-list-data', emptyData);
    // Set default for new items to not be "Seldom needed" for this test,
    // so it doesn't get filtered into the virtual category.
    mockStorage.setItem('shopping-list-new-item-default-completed', false);
    const { container } = render(React.createElement(App));

    // Check "Show checked and hidden" to ensure the toggled item remains visible for the assertion.
    await ensureShowCheckedItemsIsChecked(user, container);

    // Add an item
    const main = within(container).getByRole('main');
    const input = main.querySelector<HTMLInputElement>('#add-item-input');
    assertEquals(!!input, true, "Add item input should exist");
    await user.type(input!, 'New Item');
    
    const addButton = main.querySelector<HTMLButtonElement>('#add-item-button');
    assertEquals(!!addButton, true, "Add item button should exist");
    await user.click(addButton!);
    
    // Find the list item by its text content.
    const itemTextElement = await within(container).findByText('New Item');
    const listItem = itemTextElement.closest('li')!;
    assertEquals(!!listItem, true, "List item for 'New Item' should exist");
    const itemId = listItem.dataset.id;
    assertEquals(!!itemId, true, "List item should have a data-id");

    // Verify it's in the correct category
    const uncategorizedHeading = within(container).getByRole('heading', { name: /uncategorized/i });
    const uncategorizedCategory = uncategorizedHeading.closest('section');
    assertEquals(!!uncategorizedCategory, true, "Uncategorized category should exist");
    assertEquals(!!within(uncategorizedCategory!).getByText('New Item'), true, "New item should be in uncategorized category");

    // Toggle completion by clicking the minus button
    const decreaseButton = listItem.querySelector<HTMLButtonElement>(`#amount-control-${itemId}-decrease`);
    assertEquals(!!decreaseButton, true, "Decrease amount button should exist");
    await user.click(decreaseButton!);
    
    await waitFor(() => {
        const itemTextSpan = within(listItem).getByText('New Item');
        assertEquals(itemTextSpan.classList.contains('line-through'), true, 'Item should have line-through style');
        const amountInput = within(listItem).getByDisplayValue('0');
        assertEquals(!!amountInput, true, "Amount should now be 0");
    });

    // Open edit modal and delete
    const itemTextSpan = within(listItem).getByText('New Item');
    await user.dblClick(itemTextSpan);

    const modal = await screen.findByRole('dialog', { name: en.itemEditModal.title });
    
    const deleteButtonInModal = modal.querySelector<HTMLButtonElement>('#delete-item-button');
    assertEquals(!!deleteButtonInModal, true, "Delete button in modal should exist");
    await user.click(deleteButtonInModal!);

    // Now, find the confirmation modal.
    const confirmModal = await waitFor(() => document.querySelector('#confirm-modal'));
    assertEquals(!!confirmModal, true, "Confirmation modal should appear.");
    assertEquals(!!within(confirmModal as HTMLElement).getByText(/are you sure you want to delete "0 new item"/i), true, "Confirmation modal should contain correct text.");
    
    const confirmDeleteButton = confirmModal!.querySelector<HTMLButtonElement>('#confirm-modal-confirm-button');
    assertEquals(!!confirmDeleteButton, true, "Confirm delete button should exist");
    await user.click(confirmDeleteButton!);

    await waitFor(() => {
        assertEquals(screen.queryByText('New Item'), null, 'New Item should have been deleted');
    });
};

export function appItemsAddTestSuite() {
    const SUITE_NAME = appItemsAddTestSuite.name;
    return [
        runComponentTest('App Items: should allow adding, toggling, and deleting an item', testAddToggleDelete, SUITE_NAME, FILE_PATH),
    ];
}