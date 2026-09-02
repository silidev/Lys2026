const FILE_PATH = 'testing/suites/components/ShoppingList.actions.test.suite.ts';
import React from 'react';
import { render } from '@testing-library/react';
import { screen, waitFor, within } from '@testing-library/dom';
import sinon from 'sinon';
import ShoppingList from '../../../components/ShoppingList.tsx';
import type { ShoppingListItem } from '../../../types.ts';
import { runComponentTest, type User } from '../../helpers.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { LongPressProvider } from '../../../common/longPressTooltip/LongPressProvider.tsx';
import { LocalizationProvider } from '../../../localization/i18n.ts';
import { en } from '../../../localization/locales/en.ts';

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        React.createElement(LocalizationProvider, null,
            React.createElement(LongPressProvider, null, ui)
        )
    );
};

const testEditCategoryName = async (user: User) => {
  const onUpdateCategoryName = sinon.spy();
  const mockItems: ShoppingListItem[] = [
      { id: '1', name: 'Milk', amount: '1' },
      { id: '2', name: 'Bread', amount: '0' },
      { id: '3', name: 'Cheese', amount: '1' },
  ];
  const mockItemMap = new Map(mockItems.map(item => [item.id, item]));
  const mockCategories = [
    { id: 'dairy', name: 'Dairy', itemIds: ['1', '3'] },
    { id: 'bakery', name: 'Bakery', itemIds: ['2'] },
  ];
  const props = {
    itemMap: mockItemMap,
    categories: mockCategories,
    allCurrentCategories: mockCategories,
    allShopCategories: mockCategories,
    allHomeCategories: [],
    mode: 'shop' as const,
    onUpdateItemAmount: sinon.spy(),
    onToggleItemCompleted: sinon.spy(),
    onDeleteItem: sinon.spy(),
    onMoveItemToCategory: sinon.spy(),
    onUpdateItem: sinon.spy(),
    onUpdateCategoryName: onUpdateCategoryName,
    onReorderItem: sinon.spy(),
    onToggleDefaultCompleted: sinon.spy(),
    onToggleItemUrgent: sinon.spy(),
    onToggleItemUrgentOnce: sinon.spy(),
    onToggleHideUntilReset: sinon.spy(),
    onAddCategoryAndMoveItem: sinon.spy(),
    hideCompleted: false,
    showOnlyUrgent: false,
    showOnlyDefaultCompleted: false,
    searchTerm: '',
    advancedMode: false,
    enableSplitItemNames: false,
    lastInteractedInHomeViewId: null,
    onSetLastInteractedInHomeViewId: sinon.spy(),
  };

  renderWithProvider(React.createElement(ShoppingList, props));
  const editButton = screen.getByRole('button', { name: en.shoppingListCategory.aria.edit.replace('{0}', 'Dairy') });
  await user.click(editButton);
  const input = screen.getByRole('textbox', { name: en.shoppingListCategory.aria.edit.replace('{0}', 'Dairy') });
  await user.clear(input);
  await user.type(input, 'Dairy Products{enter}');
  await waitFor(() => {
    assertEquals(onUpdateCategoryName.calledOnceWith('dairy', 'Dairy Products'), true, "onUpdateCategoryName should be called with new name");
  });
};

const testReorderWithButtons = async (user: User) => {
    const onReorderItem = sinon.spy();
    const mockItems: ShoppingListItem[] = [
        { id: '1', name: 'Milk', amount: '1' },
        { id: '2', name: 'Bread', amount: '0' },
        { id: '3', name: 'Cheese', amount: '1' },
    ];
    const mockItemMap = new Map(mockItems.map(item => [item.id, item]));
    const mockCategories = [ { id: 'sec', name: 'Category', itemIds: ['1', '2', '3'] }];
    const props = {
      itemMap: mockItemMap,
      categories: mockCategories,
      allCurrentCategories: mockCategories,
      allShopCategories: mockCategories,
      allHomeCategories: [],
      mode: 'shop' as const,
      onUpdateItemAmount: sinon.spy(),
      onToggleItemCompleted: sinon.spy(),
      onDeleteItem: sinon.spy(),
      onMoveItemToCategory: sinon.spy(),
      onUpdateItem: sinon.spy(),
      onUpdateCategoryName: sinon.spy(),
      onReorderItem: onReorderItem,
      onToggleDefaultCompleted: sinon.spy(),
      onToggleItemUrgent: sinon.spy(),
      onToggleItemUrgentOnce: sinon.spy(),
      onToggleHideUntilReset: sinon.spy(),
      onAddCategoryAndMoveItem: sinon.spy(),
      hideCompleted: false,
      showOnlyUrgent: false,
      showOnlyDefaultCompleted: false,
      searchTerm: '',
      advancedMode: false,
      enableSplitItemNames: false,
      lastInteractedInHomeViewId: null,
      onSetLastInteractedInHomeViewId: sinon.spy(),
    };
    renderWithProvider(React.createElement(ShoppingList, props));
    const breadItem = screen.getByText('Bread').closest('li')!;
    
    const upButton = within(breadItem).getByRole('button', { name: en.shoppingListItem.aria.moveUp.replace('{0}', 'Bread') });
    await user.click(upButton);
    assertEquals(onReorderItem.calledOnceWith({ categoryId: 'sec', index: 1 }, { categoryId: 'sec', index: 0 }), true, "onReorderItem should be called for move up");

    onReorderItem.resetHistory();

    const downButton = within(breadItem).getByRole('button', { name: en.shoppingListItem.aria.moveDown.replace('{0}', 'Bread') });
    await user.click(downButton);
    assertEquals(onReorderItem.calledOnceWith({ categoryId: 'sec', index: 1 }, { categoryId: 'sec', index: 2 }), true, "onReorderItem should be called for move down");
};

export function shoppingListActionsTestSuite() {
    const SUITE_NAME = shoppingListActionsTestSuite.name;
    return [
        runComponentTest('ShoppingList Actions: allows editing a category name', testEditCategoryName, SUITE_NAME, FILE_PATH),
        runComponentTest('ShoppingList Actions: allows reordering items via buttons', testReorderWithButtons, SUITE_NAME, FILE_PATH),
    ];
}