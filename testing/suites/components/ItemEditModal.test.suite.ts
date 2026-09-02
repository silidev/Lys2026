const FILE_PATH = 'testing/suites/components/ItemEditModal.test.suite.ts';
import React from 'react';
import { render } from '@testing-library/react';
import { screen, waitFor, within } from '@testing-library/dom';
import sinon from 'sinon';
import ItemEditModal from '../../../components/ItemEditModal.tsx';
import type { ShoppingListItem } from '../../../types.ts';
import { runComponentTest, type User } from '../../helpers.ts';
import { assertEquals, assertEqualsWithoutJson } from '../../../common/testing/services/tests/helpers.ts';
import { LongPressProvider } from '../../../common/longPressTooltip/LongPressProvider.tsx';
import { LocalizationProvider } from '../../../localization/i18n.ts';
import { en } from '../../../localization/locales/en.ts';

const mockItem: ShoppingListItem = {
    id: 'item-1',
    name: 'A Test Item',
    amount: '1kg'
};

const getProps = (overrides = {}) => ({
    item: mockItem,
    onClose: sinon.spy(),
    onUpdateItem: sinon.spy(),
    onDeleteItem: sinon.spy(),
    onCloneItem: sinon.spy(),
    onToggleDefaultCompleted: sinon.spy(),
    onToggleItemUrgent: sinon.spy(),
    onToggleItemUrgentOnce: sinon.spy(),
    onToggleHideUntilReset: sinon.spy(),
    onMoveRequest: sinon.spy(),
    advancedMode: true,
    enableSplitItemNames: false,
    ...overrides,
});

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        React.createElement(LocalizationProvider, null, 
            React.createElement(LongPressProvider, null, ui)
        )
    );
};

const testInitialRenderingAndFocus = async (_user: User) => {
    const props = getProps();
    renderWithProvider(React.createElement(ItemEditModal, props));
    
    await waitFor(() => {
        const nameInput = screen.getByLabelText(en.itemEditModal.itemNameLabel) as HTMLInputElement;
        const amountInput = screen.getByLabelText(en.itemEditModal.amountLabel) as HTMLInputElement;
        assertEquals(nameInput.value, mockItem.name, "Input should display the item's name.");
        assertEquals(amountInput.value, mockItem.amount, "Amount input should display the item's amount.");

        assertEqualsWithoutJson(document.activeElement, nameInput, "Name input should be focused on render.");
        assertEquals(nameInput.selectionStart, 0, "Text selection should start at the beginning.");
        assertEquals(nameInput.selectionEnd, mockItem.name.length, "Text selection should end at the end of the name.");
    });
};

const testUpdateItemAndSave = async (user: User) => {
    const props = getProps();
    renderWithProvider(React.createElement(ItemEditModal, props));
    
    const nameInput = screen.getByLabelText(en.itemEditModal.itemNameLabel);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Item Name');

    const decreaseButton = screen.getByRole('button', { name: en.shoppingListItem.aria.decreaseQuantity.replace('{0}', 'Updated Item Name') });
    await user.click(decreaseButton);
    
    const saveButton = screen.getByRole('button', { name: en.itemEditModal.save });
    await user.click(saveButton);
    
    await waitFor(() => {
        const expectedAmount = String(parseInt('1kg', 10) - 1);
        assertEquals(props.onUpdateItem.calledOnceWith('item-1', { name: 'Updated Item Name', amount: expectedAmount, nameShop: '', alias: '', nameExport: '' }), true, "onUpdateItem should be called with updated name and amount.");
        assertEquals(props.onClose.calledOnce, true, "onClose should be called after save.");
    });
};

const testSavesOnEnterKey = async (user: User) => {
    const props = getProps();
    renderWithProvider(React.createElement(ItemEditModal, props));
    
    const nameInput = screen.getByLabelText(en.itemEditModal.itemNameLabel);
    await user.clear(nameInput);
    await user.type(nameInput, 'New Name{enter}');
    
    await waitFor(() => {
        assertEquals(props.onUpdateItem.calledOnceWith('item-1', { name: 'New Name', amount: '1kg', nameShop: '', alias: '', nameExport: '' }), true, "onUpdateItem should be called on Enter key in name field.");
        assertEquals(props.onClose.calledOnce, true, "onClose should be called after Enter key save.");
    });
};

const testSavesOnEscapeKey = async (user: User) => {
    const props = getProps();
    renderWithProvider(React.createElement(ItemEditModal, props));
    
    const input = screen.getByLabelText(en.itemEditModal.itemNameLabel);
    // Change the name so onUpdateItem is actually called.
    await user.type(input, ' changed');
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
        assertEquals(props.onUpdateItem.calledOnce, true, "onUpdateItem should be called on Escape.");
        assertEquals(props.onClose.calledOnce, true, "onClose should be called on Escape key.");
    });
};

const testDeleteAction = async (user: User) => {
    const props = getProps();
    renderWithProvider(React.createElement(ItemEditModal, props));

    const deleteButton = screen.getByRole('button', { name: en.itemEditModal.delete });
    await user.click(deleteButton);

    const confirmModal = await screen.findByRole('dialog', { name: en.itemEditModal.confirmDelete.title });
    assertEquals(!!confirmModal, true, "Confirmation modal should appear.");

    const confirmDeleteButton = within(confirmModal).getByRole('button', { name: en.itemEditModal.delete });
    await user.click(confirmDeleteButton);

    await waitFor(() => {
        assertEquals(props.onDeleteItem.calledOnceWith('item-1'), true, "onDeleteItem should be called after confirm.");
        assertEquals(props.onClose.calledOnce, true, "onClose should be called after delete.");
    });
};

const testCloneAction = async (user: User) => {
    const props = getProps();
    renderWithProvider(React.createElement(ItemEditModal, props));

    const cloneButton = screen.getByRole('button', { name: en.itemEditModal.clone });
    await user.click(cloneButton);

    await waitFor(() => {
        assertEquals(props.onCloneItem.calledOnceWith('item-1'), true, "onCloneItem should be called.");
        assertEquals(props.onClose.calledOnce, true, "onClose should be called after clone.");
    });
};

const testToggleDefaultCompletedAction = async (user: User) => {
    const onToggleSpy = sinon.spy();
    const props = getProps({ 
        item: { ...mockItem, defaultCompleted: false }, 
        onToggleDefaultCompleted: onToggleSpy 
    });
    const { rerender } = renderWithProvider(React.createElement(ItemEditModal, props));
    
    const oftenNeededRadio = screen.getByLabelText(new RegExp(en.itemEditModal.oftenNeeded)) as HTMLInputElement;
    const seldomNeededRadio = screen.getByLabelText(new RegExp(en.itemEditModal.seldomNeeded)) as HTMLInputElement;

    assertEquals(oftenNeededRadio.checked, true, "Often needed radio should be initially checked");
    assertEquals(seldomNeededRadio.checked, false, "Seldom needed radio should be initially unchecked");

    await user.click(seldomNeededRadio);
    
    assertEquals(onToggleSpy.calledOnceWith('item-1'), true, "onToggleDefaultCompleted should be called.");

    // Rerender with updated item props to check if UI updates
    rerender(React.createElement(LocalizationProvider, null, React.createElement(LongPressProvider, null, React.createElement(ItemEditModal, getProps({ 
        item: { ...mockItem, defaultCompleted: true }, 
        onToggleDefaultCompleted: onToggleSpy 
    })))));

    const oftenNeededRadioAfterClick = screen.getByLabelText(new RegExp(en.itemEditModal.oftenNeeded)) as HTMLInputElement;
    const seldomNeededRadioAfterClick = screen.getByLabelText(new RegExp(en.itemEditModal.seldomNeeded)) as HTMLInputElement;
    assertEquals(oftenNeededRadioAfterClick.checked, false, "Often needed radio should be unchecked after toggle");
    assertEquals(seldomNeededRadioAfterClick.checked, true, "Seldom needed radio should be checked after toggle");
    assertEquals(props.onClose.notCalled, true, "Modal should not close on radio toggle");

    // Test toggling back
    await user.click(oftenNeededRadioAfterClick);
    assertEquals(onToggleSpy.calledTwice, true, "onToggleDefaultCompleted should be called again when switching back to 'often needed'.");
};

const testToggleItemUrgentAction = async (user: User) => {
    // ARRANGE: Set up test data and spies
    const onToggleUrgentSpy = sinon.spy();
    const initialItem = { ...mockItem, isRush: false }; // Start with non-urgent item
    const updatedItem = { ...mockItem, isRush: true };  // Expected state after toggle
    
    const initialProps = getProps({
        item: initialItem,
        onToggleItemUrgent: onToggleUrgentSpy
    });
    
    // Render the modal with initial props
    const { rerender } = renderWithProvider(React.createElement(ItemEditModal, initialProps));

    // ASSERT: Verify initial state
    const urgentCheckbox = screen.getByTestId('item-edit-urgent-checkbox') as HTMLInputElement;
    assertEquals(urgentCheckbox.checked, false, "Urgent checkbox should start unchecked for non-urgent item");

    // ACT: User clicks the urgent checkbox
    await user.click(urgentCheckbox);

    // ASSERT: Verify the callback was triggered correctly
    assertEquals(onToggleUrgentSpy.calledOnceWith('item-1'), true, 
        "onToggleItemUrgent should be called with the item ID when checkbox is clicked");

    // SIMULATE: Parent component updates the item state (this would happen in real usage)
    const updatedProps = getProps({
        item: updatedItem,
        onToggleItemUrgent: onToggleUrgentSpy
    });
    rerender(React.createElement(LocalizationProvider, null, React.createElement(LongPressProvider, null, React.createElement(ItemEditModal, updatedProps))));

    // ASSERT: Verify UI reflects the updated state
    const updatedCheckbox = screen.getByTestId('item-edit-urgent-checkbox') as HTMLInputElement;
    assertEquals(updatedCheckbox.checked, true, "Urgent checkbox should be checked after state update");
    
    // ASSERT: Verify modal behavior
    assertEquals(initialProps.onClose.notCalled, true, 
        "Modal should remain open when toggling urgent state (only name/amount changes should close it)");
};

const testCallsOnMoveRequest = async (user: User) => {
    const props = getProps();
    renderWithProvider(React.createElement(ItemEditModal, props));

    const homeButton = screen.getByRole('button', { name: new RegExp(en.itemEditModal.selectHomeCategory) });
    await user.click(homeButton);
    assertEquals(props.onMoveRequest.calledOnceWith('home'), true, "onMoveRequest should be called with 'home'");
    
    const shopButton = screen.getByRole('button', { name: new RegExp(en.itemEditModal.selectShopCategory) });
    await user.click(shopButton);
    assertEquals(props.onMoveRequest.calledWith('shop'), true, "onMoveRequest should be called with 'shop'");
    assertEquals(props.onMoveRequest.callCount, 2);
};

const testUpdatesAlias = async (user: User) => {
    const props = getProps();
    renderWithProvider(React.createElement(ItemEditModal, props));
    
    const aliasInput = screen.getByLabelText(en.itemEditModal.aliasLabel);
    await user.clear(aliasInput);
    await user.type(aliasInput, 'Test Alias');
    
    const saveButton = screen.getByRole('button', { name: en.itemEditModal.save });
    await user.click(saveButton);
    
    await waitFor(() => {
        assertEquals(props.onUpdateItem.calledOnce, true, "onUpdateItem should be called");
        const args = props.onUpdateItem.firstCall.args;
        assertEquals(args[1].alias, 'Test Alias', "Alias should be updated");
    });
};

export function itemEditModalTestSuite() {
    const SUITE_NAME = itemEditModalTestSuite.name;
    return [
        runComponentTest('ItemEditModal: should render with correct value, focus, and text selection', testInitialRenderingAndFocus, SUITE_NAME, FILE_PATH),
        runComponentTest('ItemEditModal: should update item name and amount on save', testUpdateItemAndSave, SUITE_NAME, FILE_PATH),
        runComponentTest('ItemEditModal: should save changes on Enter key', testSavesOnEnterKey, SUITE_NAME, FILE_PATH),
        runComponentTest('ItemEditModal: should save on Escape key', testSavesOnEscapeKey, SUITE_NAME, FILE_PATH),
        runComponentTest('ItemEditModal: should handle delete action', testDeleteAction, SUITE_NAME, FILE_PATH),
        runComponentTest('ItemEditModal: should handle clone action', testCloneAction, SUITE_NAME, FILE_PATH),
        runComponentTest('ItemEditModal: should toggle default completed state', testToggleDefaultCompletedAction, SUITE_NAME, FILE_PATH),
        runComponentTest('ItemEditModal: should toggle urgent state', testToggleItemUrgentAction, SUITE_NAME, FILE_PATH),
        runComponentTest('ItemEditModal: should call onMoveRequest with correct mode', testCallsOnMoveRequest, SUITE_NAME, FILE_PATH),
        runComponentTest('ItemEditModal: should update alias', testUpdatesAlias, SUITE_NAME, FILE_PATH),
    ];
}