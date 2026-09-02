



import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import sinon from 'sinon';
import CategoryManager from '../../../components/CategoryManager.tsx';
import type { Category } from '../../../types.ts';
import { runComponentTest, type User } from '../../helpers.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { LongPressProvider } from '../../../common/longPressTooltip/LongPressProvider.tsx';
import { LocalizationProvider } from '../../../localization/i18n.ts';
import { en } from '../../../localization/locales/en.ts';

const FILE_PATH = 'testing/suites/components/CategoryManager.delete.test.suite.ts';

const categoriesWithMixed: Category[] = [
    { id: 'sec-empty', name: 'Empty Category', itemIds: [] },
    { id: 'sec-full', name: 'Full Category', itemIds: ['item-1'] },
];

const getProps = (overrides = {}) => ({
    title: 'Delete Test Category Manager',
    categories: categoriesWithMixed,
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

const testEnablesDeleteForEmpty = async (user: User) => {
    renderWithProvider(React.createElement(CategoryManager, getProps()));
    await user.click(screen.getByRole('heading', { name: /delete test category manager/i }));
    const deleteButton = screen.getByRole('button', { name: en.categoryManagerItem.aria.delete.replace('{0}', 'Empty Category') }) as HTMLButtonElement;
    assertEquals(deleteButton.disabled, false, "Delete button for empty category should be enabled");
};

const testDisablesDeleteForNonEmpty = async (user: User) => {
    renderWithProvider(React.createElement(CategoryManager, getProps()));
    await user.click(screen.getByRole('heading', { name: /delete test category manager/i }));
    const deleteButton = screen.getByRole('button', { name: en.categoryManagerItem.aria.delete.replace('{0}', 'Full Category') }) as HTMLButtonElement;
    assertEquals(deleteButton.disabled, true, "Delete button for non-empty category should be disabled");
};

const testCallsOnDelete = async (user: User) => {
    const onDelete = sinon.spy();
    renderWithProvider(React.createElement(CategoryManager, getProps({ onDelete })));
    await user.click(screen.getByRole('heading', { name: /delete test category manager/i }));
    const deleteButton = screen.getByRole('button', { name: en.categoryManagerItem.aria.delete.replace('{0}', 'Empty Category') });
    await user.click(deleteButton);
    assertEquals(onDelete.calledOnceWith('sec-empty'), true, "onDelete should be called with the correct category ID");
};

export function categoryManagerDeleteTestSuite() {
    const SUITE_NAME = categoryManagerDeleteTestSuite.name;
    return [
        runComponentTest('CategoryManager Delete: enables delete button for empty categories', testEnablesDeleteForEmpty, SUITE_NAME, FILE_PATH),
        runComponentTest('CategoryManager Delete: disables delete button for non-empty categories', testDisablesDeleteForNonEmpty, SUITE_NAME, FILE_PATH),
        runComponentTest('CategoryManager Delete: calls onDelete with category id when delete button is clicked', testCallsOnDelete, SUITE_NAME, FILE_PATH),
    ];
}