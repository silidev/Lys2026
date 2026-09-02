import React from 'react';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import sinon from 'sinon';
import CategoryManager from '../../../components/CategoryManager.tsx';
import { runComponentTest, type User } from '../../helpers.ts';
import { assertEquals, assert } from '../../../common/testing/services/tests/helpers.ts';
import { LongPressProvider } from '../../../common/longPressTooltip/LongPressProvider.tsx';
import { LocalizationProvider } from '../../../localization/i18n.ts';
import { en } from '../../../localization/locales/en.ts';

const FILE_PATH = 'testing/suites/components/CategoryManager.add.test.suite.ts';

const getProps = (overrides = {}) => ({
  title: 'Add Test Category Manager',
  categories: [],
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

const testCallsOnAddAndClearsForm = async (user: User) => {
    const onAdd = sinon.spy();
    renderWithProvider(React.createElement(CategoryManager, getProps({ onAdd })));
    await user.click(screen.getByRole('heading', { name: /add test category manager/i }));
    
    const addButton = await screen.findByRole('button', { name: en.categoryManager.addCategory });
    await user.click(addButton);

    const input = await screen.findByPlaceholderText(en.addCategoryForm.placeholder) as HTMLInputElement;
    await user.type(input, 'New Category {Enter}');

    await waitFor(() => {
        assertEquals(onAdd.calledOnceWith('New Category'), true, "onAdd should be called with trimmed category name");
    });
    
    assertEquals(screen.queryByPlaceholderText(en.addCategoryForm.placeholder), null, "Input field should disappear after save");
};

const testSaveButtonDisabledWhenEmpty = async (user: User) => {
    renderWithProvider(React.createElement(CategoryManager, getProps()));
    await user.click(screen.getByRole('heading', { name: /add test category manager/i }));
    await user.click(screen.getByRole('button', { name: en.categoryManager.addCategory }));
    
    const saveButton = document.querySelector('#save-new-category-button') as HTMLButtonElement;
    assert(!!saveButton, "Save button not found by ID");

    assertEquals(saveButton.disabled, true, "Save button should be disabled when input is empty");
    const input = screen.getByPlaceholderText(en.addCategoryForm.placeholder);
    await user.type(input, 'a');
    await waitFor(() => {
        assertEquals(saveButton.disabled, false, "Save button should be enabled when input has text");
    });
};

export function categoryManagerAddTestSuite() {
    const SUITE_NAME = categoryManagerAddTestSuite.name;
    return [
        runComponentTest('CategoryManager Add: calls onAdd with the new name and clears the form on save', testCallsOnAddAndClearsForm, SUITE_NAME, FILE_PATH),
        runComponentTest('CategoryManager Add: Save button is disabled when input is empty', testSaveButtonDisabledWhenEmpty, SUITE_NAME, FILE_PATH),
    ];
}