



import React from 'react';
import { render } from '@testing-library/react';
import { within } from '@testing-library/dom';
import sinon from 'sinon';
import ShoppingListItemComponent from '../../../components/ShoppingListItem.tsx';
import type { ShoppingListItem } from '../../../types.ts';
import { runComponentTest, type User } from '../../helpers.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { LongPressProvider } from '../../../common/longPressTooltip/LongPressProvider.tsx';
import { LocalizationProvider } from '../../../localization/i18n.ts';

const FILE_PATH = 'testing/suites/components/ShoppingListItem.test.suite.ts';

const item: ShoppingListItem = { id: '1', name: 'Milk' };

const getProps = (overrides = {}) => ({
    item: item,
    index: 0,
    onUpdateAmount: sinon.spy(),
    onToggleItemCompleted: sinon.spy(),
    onOpenEditModal: sinon.spy(),
    onDragStart: sinon.spy(),
    onDrop: sinon.spy(),
    onDragEnd: sinon.spy(),
    isDragging: false,
    currentCategoryId: 'sec1',
    onMoveUp: sinon.spy(),
    onMoveDown: sinon.spy(),
    isFirst: false,
    isLast: false,
    mode: 'home' as const,
    onOpenMoveModal: sinon.spy(),
    isUncategorized: false,
    onSelectItem: sinon.spy(),
    ...overrides,
});

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        React.createElement(LocalizationProvider, null,
            React.createElement(LongPressProvider, null, ui)
        )
    );
};

const testRendersItem = async (_user: User) => {
    const { container, rerender } = renderWithProvider(React.createElement(ShoppingListItemComponent, getProps()));
    // First render, no amount
    assertEquals(!!within(container).getByDisplayValue('1'), true, "Amount '1' should be rendered");
    assertEquals(!!within(container).getByText('Milk'), true, "Item name should be rendered");
    
    // Test with amount
    const itemWithAmount: ShoppingListItem = { id: '1', name: 'Milk', amount: '1l' };
    rerender(React.createElement(LocalizationProvider, null, React.createElement(LongPressProvider, null, React.createElement(ShoppingListItemComponent, getProps({ item: itemWithAmount })))));
    assertEquals(!!within(container).getByDisplayValue('1l'), true, "Amount '1l' should be rendered");
    assertEquals(within(container).queryByText('1l Milk'), null, "Item name and amount should not be rendered together in displayName span");
    assertEquals(!!within(container).getByText('Milk'), true, "Item name should be rendered without amount in displayName span");
};

const testCallsOnUpdateAmount = async (user: User) => {
    const onUpdateAmount = sinon.spy();
    const { container } = renderWithProvider(React.createElement(ShoppingListItemComponent, getProps({ onUpdateAmount })));
    
    const plusButton = container.querySelector<HTMLButtonElement>('#amount-control-1-increase');
    assertEquals(!!plusButton, true, "Increase button should exist");
    await user.click(plusButton!);
    assertEquals(onUpdateAmount.calledOnceWith('1', 1), true, "onUpdateAmount should be called with item ID and delta +1");
    
    const minusButton = container.querySelector<HTMLButtonElement>('#amount-control-1-decrease');
    assertEquals(!!minusButton, true, "Decrease button should exist");
    await user.click(minusButton!);
    assertEquals(onUpdateAmount.calledWith('1', -1), true, "onUpdateAmount should be called with item ID and delta -1");
    assertEquals(onUpdateAmount.callCount, 2);
};

const testCallsOnOpenEditModalOnDoubleClick = async (user: User) => {
    const onOpenEditModal = sinon.spy();
    const { container } = renderWithProvider(React.createElement(ShoppingListItemComponent, getProps({ onOpenEditModal })));
    const itemText = within(container).getByText('Milk');
    await user.dblClick(itemText);
    assertEquals(onOpenEditModal.calledOnceWith('1', 'sec1'), true, "onOpenEditModal should be called with item ID and category ID on double click of the item text");
};

const testCallsOnSelectItemOnClick = async (user: User) => {
    const onSelectItem = sinon.spy();
    const { container, rerender } = renderWithProvider(React.createElement(ShoppingListItemComponent, getProps({ onSelectItem, mode: 'home' })));
    const itemText = within(container).getByText('Milk');
    await user.click(itemText);
    assertEquals(onSelectItem.calledOnceWith('1'), true, "onSelectItem should be called with item ID on click in home mode");

    // Test that it does not fire in 'shop' mode
    onSelectItem.resetHistory();
    rerender(React.createElement(LocalizationProvider, null, React.createElement(LongPressProvider, null, React.createElement(ShoppingListItemComponent, getProps({ onSelectItem, mode: 'shop' })))));
    const itemTextShop = within(container).getByText('Milk');
    await user.click(itemTextShop);
    assertEquals(onSelectItem.called, false, "onSelectItem should not be called on click in shop mode");
};

export function shoppingListItemTestSuite() {
    const SUITE_NAME = shoppingListItemTestSuite.name;
    return [
        runComponentTest('ShoppingListItem: renders item name and amount', testRendersItem, SUITE_NAME, FILE_PATH),
        runComponentTest('ShoppingListItem: calls onUpdateAmount when +/- buttons are clicked', testCallsOnUpdateAmount, SUITE_NAME, FILE_PATH),
        runComponentTest('ShoppingListItem: calls onOpenEditModal on double click', testCallsOnOpenEditModalOnDoubleClick, SUITE_NAME, FILE_PATH),
        runComponentTest('ShoppingListItem: calls onSelectItem on click in home mode', testCallsOnSelectItemOnClick, SUITE_NAME, FILE_PATH),
    ];
}