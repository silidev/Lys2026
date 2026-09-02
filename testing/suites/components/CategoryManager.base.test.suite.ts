const FILE_PATH = 'testing/suites/components/CategoryManager.base.test.suite.ts';
import React from 'react';
import { render } from '@testing-library/react';
import { screen, within } from '@testing-library/dom';
import sinon from 'sinon';
import CategoryManager from '../../../components/CategoryManager.tsx';
import type { Category } from '../../../types.ts';
import { runComponentTest, type User } from '../../helpers.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { LongPressProvider } from '../../../common/longPressTooltip/LongPressProvider.tsx';
import { LocalizationProvider } from '../../../localization/i18n.ts';

const mockCategories: Category[] = [
    { id: 'sec1', name: 'Category One', itemIds: [] },
    { id: 'sec2', name: 'Category Two', itemIds: ['item1'] },
];

const getProps = (overrides = {}) => ({
    title: 'My Test Categories',
    categories: mockCategories,
    onReorder: sinon.spy(),
    onAdd: sinon.spy(),
    onDelete: sinon.spy(),
    onUpdateCategoryName: sinon.spy(),
    onToggleHideable: sinon.spy(),
    ...overrides,
});

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        React.createElement(LocalizationProvider, null, 
            React.createElement(LongPressProvider, null, ui)
        )
    );
};

const testRendersTitleAndCategories = async (user: User) => {
    const { container } = renderWithProvider(React.createElement(CategoryManager, getProps()));

    // Check for the main title of the manager
    const heading = within(container).getByRole('heading', { name: /my test categories/i });
    assertEquals(!!heading, true, "Component title should be rendered");

    await user.click(heading);

    // Check that each category is rendered
    assertEquals(!!within(container).getByText('Category One'), true, "Category One should be rendered");
    assertEquals(!!within(container).getByText('Category Two'), true, "Category Two should be rendered");

    // Find the specific list within the component's container.
    const list = within(container).getByRole('list');
    
    // Check that the list has the correct number of items.
    const listItems = within(list).getAllByRole('listitem');
    assertEquals(listItems.length, mockCategories.length, "Should render the correct number of categories");
};

const testRendersAddButton = async (user: User) => {
    renderWithProvider(React.createElement(CategoryManager, getProps()));
    await user.click(screen.getByRole('heading', { name: /my test categories/i }));
    assertEquals(!!screen.getByRole('button', { name: /add category/i }), true, "Add Category button should be rendered");
};

export function categoryManagerBaseTestSuite() {
    const SUITE_NAME = categoryManagerBaseTestSuite.name;
    return [
        runComponentTest('CategoryManager Base: renders title and all categories', testRendersTitleAndCategories, SUITE_NAME, FILE_PATH),
        runComponentTest('CategoryManager Base: renders the "Add Category" button', testRendersAddButton, SUITE_NAME, FILE_PATH),
    ];
}