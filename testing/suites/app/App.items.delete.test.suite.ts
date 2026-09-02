



const FILE_PATH = 'testing/suites/app/App.items.delete.test.suite.ts';
import React from 'react';
import { render } from '@testing-library/react';
import { screen, waitFor, within } from '@testing-library/dom';
import App from '../../../App.tsx';
import { runComponentTest, type User } from '../../helpers.ts';
import type { MockStorageService } from '../../mocks/storageService.mock.ts';
import type { ShoppingListData } from '../../../types.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { en } from '../../../localization/locales/en.ts';

const testDeleteItemViaModal = async (user: User, mockStorage: MockStorageService) => {
    const initialData: ShoppingListData = {
        items: [{ id: 'item-to-delete', name: 'Delete Me', amount: '1' }],
        shopCategories: [{ id: 's1', name: 'A Category', itemIds: ['item-to-delete'] }],
        homeCategories: [{ id: 'h1', name: 'A Category', itemIds: ['item-to-delete'] }],
    };
    mockStorage.setItem('shopping-list-data', initialData);
    const { container } = render(React.createElement(App));

    // Open the modal
    const itemTextElement = await within(container).findByText('Delete Me');
    await user.dblClick(itemTextElement);

    const modal = await screen.findByRole('dialog', { name: en.itemEditModal.title });
    assertEquals(!!modal, true, "Edit modal should be open.");

    // Click delete in the edit modal
    const deleteButton = modal.querySelector<HTMLButtonElement>('#delete-item-button');
    assertEquals(!!deleteButton, true, "Delete button should exist in modal");
    await user.click(deleteButton!);
    
    // Assert the confirmation modal appears
    const confirmModal = await waitFor(() => document.querySelector('#confirm-modal'));
    assertEquals(!!confirmModal, true, "Confirmation modal should appear.");
    assertEquals(!!within(confirmModal as HTMLElement).getByText(/are you sure you want to delete "1 delete me"/i), true, "Confirmation modal should contain correct text.");
    
    // Click the final delete button in the confirmation modal
    const confirmDeleteButton = confirmModal!.querySelector<HTMLButtonElement>('#confirm-modal-confirm-button');
    assertEquals(!!confirmDeleteButton, true, "Confirm delete button should exist");
    await user.click(confirmDeleteButton!);

    // Assert modal is closed and item is gone
    await waitFor(() => {
        const stillOpenModal = screen.queryByRole('dialog', { name: /edit item/i });
        assertEquals(stillOpenModal, null, "Modal should be closed after deletion.");
    });

    await waitFor(() => {
        const deletedItem = screen.queryByText('Delete Me');
        assertEquals(deletedItem, null, "Item 'Delete Me' should be removed from the DOM.");
    });
};

export function appItemsDeleteTestSuite() {
    const SUITE_NAME = appItemsDeleteTestSuite.name;
    return [
        runComponentTest('App Delete Item: should delete an item via the edit modal', testDeleteItemViaModal, SUITE_NAME, FILE_PATH),
    ];
}