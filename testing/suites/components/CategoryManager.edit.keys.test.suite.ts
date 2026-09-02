



import React from 'react';
import { render } from '@testing-library/react';
import { screen, within, waitFor } from '@testing-library/dom';
import sinon from 'sinon';
import CategoryManager from '../../../components/CategoryManager.tsx';
import type { Category } from '../../../types.ts';
import { runComponentTest, type User } from '../../helpers.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { LongPressProvider } from '../../../common/longPressTooltip/LongPressProvider.tsx';
import { LocalizationProvider } from '../../../localization/i18n.ts';
import { en } from '../../../localization/locales/en.ts';

const FILE_PATH = 'testing/suites/components/CategoryManager.edit.keys.test.suite.ts';

const getProps = (overrides = {}) => {
    const mockCategories: Category[] = [
        { id: 'sec1', name: 'Category 1', itemIds: [] },
        { id: 'sec2', name: 'Category 2', itemIds: [] },
    ];
    return {
        title: 'Test Keys Category Manager',
        categories: mockCategories,
        onReorder: sinon.spy(),
        onAdd: sinon.spy(),
        onDelete: sinon.spy(),
        onUpdateCategoryName: sinon.spy(),
        onToggleHideable: sinon.spy(),
        ...overrides,
    };
};

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        React.createElement(LocalizationProvider, null,
            React.createElement(LongPressProvider, null, ui)
        )
    );
};

const testSavesOnEnterCancelsOnEscape = async (user: User) => {
    const onUpdateCategoryName = sinon.spy();
    renderWithProvider(React.createElement(CategoryManager, getProps({ onUpdateCategoryName })));
    
    await user.click(screen.getByRole('heading', { name: /Test Keys Category Manager/i }));

    // Save with Enter
    const category1Row = screen.getByText('Category 1').closest('li')!;
    await user.click(within(category1Row).getByRole('button', { name: en.categoryManagerItem.aria.edit.replace('{0}', 'Category 1') }));
    const input1 = within(category1Row).getByDisplayValue('Category 1');
    await user.clear(input1);
    await user.type(input1, 'New Name 1{enter}');
    await waitFor(() => {
        assertEquals(onUpdateCategoryName.calledWith('sec1', 'New Name 1'), true, "onUpdateCategoryName should be called with new name on Enter");
    });
    
    // Cancel with Escape
    const category2Row = screen.getByText('Category 2').closest('li')!;
    await user.click(within(category2Row).getByRole('button', { name: en.categoryManagerItem.aria.edit.replace('{0}', 'Category 2') }));
    const input2 = within(category2Row).getByDisplayValue('Category 2');
    await user.clear(input2);
    await user.type(input2, 'Should not be saved{escape}');
    // The spy should not have been called again.
    assertEquals(onUpdateCategoryName.callCount, 1, "onUpdateCategoryName should not be called on Escape");
};

export function categoryManagerEditKeysTestSuite() {
    const SUITE_NAME = categoryManagerEditKeysTestSuite.name;
    return [
        runComponentTest('CategoryManager Edit: saves on Enter and cancels on Escape', testSavesOnEnterCancelsOnEscape, SUITE_NAME, FILE_PATH),
    ];
}