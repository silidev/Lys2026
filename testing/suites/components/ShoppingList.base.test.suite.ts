




const FILE_PATH = 'testing/suites/components/ShoppingList.base.test.suite.ts';
import React from 'react';
import { render } from '@testing-library/react';
import { screen, within } from '@testing-library/dom';
import ShoppingList from '../../../components/ShoppingList.tsx';
import type { ShoppingListItem } from '../../../types.ts';
import { runComponentTest, type User } from '../../helpers.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { LongPressProvider } from '../../../common/longPressTooltip/LongPressProvider.tsx';
import { LocalizationProvider } from '../../../localization/i18n.ts';

const getBaseProps = (overrides = {}) => ({
  categories: [],
  allCurrentCategories: [],
  allShopCategories: [],
  allHomeCategories: [],
  itemMap: new Map(),
  mode: 'shop' as const,
  onUpdateItemAmount: () => {},
  onToggleItemCompleted: () => {},
  onDeleteItem: () => {},
  onMoveItemToCategory: () => {},
  onUpdateItem: () => {},
  onUpdateCategoryName: () => {},
  onReorderItem: () => {},
  onToggleDefaultCompleted: () => {},
  onToggleItemUrgent: () => {},
  onToggleItemUrgentOnce: () => {},
  onToggleHideUntilReset: () => {},
  onAddCategoryAndMoveItem: () => {},
  hideCompleted: false,
  showOnlyUrgent: false,
  showOnlyDefaultCompleted: false,
  searchTerm: '',
  advancedMode: false,
  enableSplitItemNames: false,
  lastInteractedInHomeViewId: null,
  onSetLastInteractedInHomeViewId: () => {},
  ...overrides,
});

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        React.createElement(LocalizationProvider, null, 
            React.createElement(LongPressProvider, null, ui)
        )
    );
};

const testRendersEmptyMessage = async (_user: User) => {
    const props = getBaseProps();
    renderWithProvider(React.createElement(ShoppingList, props));
    assertEquals(!!screen.queryByText(/your shopping list is empty/i), true, "Empty list message should be displayed");
};

const testRendersCategoriesAndItems = async (_user: User) => {
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
    const props = getBaseProps({
        itemMap: mockItemMap,
        categories: mockCategories,
        allCurrentCategories: mockCategories,
        allShopCategories: mockCategories,
        allHomeCategories: [],
    });
    renderWithProvider(React.createElement(ShoppingList, props));
    const dairyHeader = screen.getByRole('heading', { name: 'Dairy' });
    const bakeryHeader = screen.getByRole('heading', { name: 'Bakery' });
    assertEquals(!!dairyHeader, true, "Dairy category header should be rendered");
    assertEquals(!!bakeryHeader, true, "Bakery category header should be rendered");
    const dairyCategory = dairyHeader.closest('section')!;
    const dairyItems = within(dairyCategory).getAllByRole('listitem');
    assertEquals(dairyItems.length, 2, "Dairy category should have 2 items");
    assertEquals(!!within(dairyItems[0]).getByText('Milk'), true, "Milk should be in the dairy category");
};

const testRendersEmptyCategoryMessage = async (_user: User) => {
    const mockItems: ShoppingListItem[] = [{ id: '1', name: 'Milk', amount: '1' }];
    const mockItemMap = new Map(mockItems.map(item => [item.id, item]));
    const mockCategories = [
      { id: 'dairy', name: 'Dairy', itemIds: ['1'] },
      { id: 'empty', name: 'Empty Category', itemIds: [] },
    ];
    const props = getBaseProps({
        itemMap: mockItemMap,
        categories: mockCategories,
        allCurrentCategories: mockCategories,
        allShopCategories: mockCategories,
        allHomeCategories: [],
    });
    const { container } = renderWithProvider(React.createElement(ShoppingList, props));
    const emptyCategoryMessage = container.querySelector('#empty-category-message-empty');
    assertEquals(!!emptyCategoryMessage, true, "Message for empty category should be displayed");
};

export function shoppingListBaseTestSuite() {
    const SUITE_NAME = shoppingListBaseTestSuite.name;
    return [
        runComponentTest('ShoppingList Base: renders empty message when there are no items', testRendersEmptyMessage, SUITE_NAME, FILE_PATH),
        runComponentTest('ShoppingList Base: renders all categories and items', testRendersCategoriesAndItems, SUITE_NAME, FILE_PATH),
        runComponentTest('ShoppingList Base: renders a message for categories with no items', testRendersEmptyCategoryMessage, SUITE_NAME, FILE_PATH),
    ];
}