import React from 'react';
import { render } from '@testing-library/react';
import { screen, within, waitFor } from '@testing-library/dom';
import sinon from 'sinon';
import MoveItemModal from '../../../components/MoveItemModal.tsx';
import type { ShoppingListItem, Category } from '../../../types.ts';
import { runComponentTest, type User } from '../../helpers.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { LongPressProvider } from '../../../common/longPressTooltip/LongPressProvider.tsx';
import { LocalizationProvider } from '../../../localization/i18n.ts';
import { en } from '../../../localization/locales/en.ts';

const FILE_PATH = 'testing/suites/components/MoveItemModal.test.suite.ts';

const mockItem: ShoppingListItem = { id: 'item-1', name: 'Milk', amount: '1' };
const mockCategories: Category[] = [
    { id: 'sec-1', name: 'Dairy', itemIds: ['item-1'] },
    { id: 'sec-2', name: 'Bakery', itemIds: [] },
    { id: 'sec-3', name: 'Produce', itemIds: [] },
];

const getProps = (overrides = {}) => ({
    item: mockItem,
    categories: mockCategories,
    currentCategoryId: 'sec-1',
    onMove: sinon.spy(),
    onClose: sinon.spy(),
    onAddNewCategory: sinon.spy(),
    viewMode: 'shop' as const,
    ...overrides,
});

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        React.createElement(LocalizationProvider, null, 
            React.createElement(LongPressProvider, null, ui)
        )
    );
};

const testRendersModal = async (_user: User) => {
    renderWithProvider(React.createElement(MoveItemModal, getProps()));
    const modalTitle = `${en.moveItemModal.title_prefix}${mockItem.name}${en.moveItemModal.title_suffix}`;
    const modal = screen.getByRole('dialog', { name: modalTitle });
    assertEquals(!!modal, true, "Modal should be rendered");
    assertEquals(!!within(modal).getByText('Dairy'), true, "Dairy category should be listed");
    assertEquals(!!within(modal).getByText('Bakery'), true, "Bakery category should be listed");
    assertEquals(!!within(modal).getByText('Produce'), true, "Produce category should be listed");
};

const testDisablesCurrentCategoryButton = async (_user: User) => {
    renderWithProvider(React.createElement(MoveItemModal, getProps()));
    const dairyButton = screen.getByRole('button', { name: en.moveItemModal.aria.moveTo.replace('{0}', 'Dairy') }) as HTMLButtonElement;
    const bakeryButton = screen.getByRole('button', { name: en.moveItemModal.aria.moveTo.replace('{0}', 'Bakery') }) as HTMLButtonElement;
    assertEquals(dairyButton.disabled, true, "Current category's button should be disabled");
    assertEquals(bakeryButton.disabled, false, "Other category's button should be enabled");
};

const testCallsOnMove = async (user: User) => {
    const onMove = sinon.spy();
    renderWithProvider(React.createElement(MoveItemModal, getProps({ onMove })));
    const produceButton = screen.getByRole('button', { name: en.moveItemModal.aria.moveTo.replace('{0}', 'Produce') });
    await user.click(produceButton);
    assertEquals(onMove.calledOnceWith('sec-3'), true, "onMove should be called with the new category ID");
};

const testCallsOnClose = async (user: User) => {
    const onClose = sinon.spy();
    renderWithProvider(React.createElement(MoveItemModal, getProps({ onClose })));
    const cancelButton = screen.getByRole('button', { name: en.moveItemModal.cancel });
    await user.click(cancelButton);
    await waitFor(() => {
        assertEquals(onClose.calledOnce, true, "onClose should be called when cancel button is clicked");
    });
};

export function moveItemModalTestSuite() {
    const SUITE_NAME = moveItemModalTestSuite.name;
    return [
        runComponentTest('MoveItemModal: renders the modal with item name and categories', testRendersModal, SUITE_NAME, FILE_PATH),
        runComponentTest('MoveItemModal: disables the button for the current category', testDisablesCurrentCategoryButton, SUITE_NAME, FILE_PATH),
        runComponentTest('MoveItemModal: calls onMove when a category button is clicked', testCallsOnMove, SUITE_NAME, FILE_PATH),
        runComponentTest('MoveItemModal: calls onClose when the cancel button is clicked', testCallsOnClose, SUITE_NAME, FILE_PATH),
    ];
}