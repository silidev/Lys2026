



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

const FILE_PATH = 'testing/suites/components/CategoryManager.edit.name.test.suite.ts';

const getProps = (overrides = {}) => {
    const mockCategories: Category[] = [
        { id: 'sec1', name: 'Category 1', itemIds: [] },
        { id: 'sec2', name: 'Category 2', itemIds: [] },
    ];
    return {
        title: 'Test Name Category Manager',
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

const testAllowsEditingName = async (user: User) => {
    const onUpdateCategoryName = sinon.spy();
    renderWithProvider(React.createElement(CategoryManager, getProps({ onUpdateCategoryName })));
    
    await user.click(screen.getByRole('heading', { name: /Test Name Category Manager/i }));

    const category1Row = screen.getByText('Category 1').closest('li')!;
    const editButton = within(category1Row).getByRole('button', { name: en.categoryManagerItem.aria.edit.replace('{0}', 'Category 1') });
    await user.click(editButton);
    
    const input = within(category1Row).getByDisplayValue('Category 1');
    assertEquals(input.tagName, 'INPUT', "An input element should be rendered for editing");
    
    await user.clear(input);
    await user.type(input, 'Renamed Category');
    await user.tab(); // Use tab to blur the input

    await waitFor(() => {
        assertEquals(onUpdateCategoryName.calledOnceWith('sec1', 'Renamed Category'), true, "onUpdateCategoryName should be called with the new name");
    });
};

export function categoryManagerEditNameTestSuite() {
    const SUITE_NAME = categoryManagerEditNameTestSuite.name;
    return [
        runComponentTest('CategoryManager Edit: allows editing a category name by clicking the pencil icon', testAllowsEditingName, SUITE_NAME, FILE_PATH),
    ];
}