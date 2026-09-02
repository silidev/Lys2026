import React, { useState } from 'react';
import { render } from '@testing-library/react';
import { within, waitFor } from '@testing-library/dom';
import sinon from 'sinon';
import AddItemForm from '../../../components/AddItemForm.tsx';
import { runComponentTest, type User } from '../../helpers.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { LongPressProvider } from '../../../common/longPressTooltip/LongPressProvider.tsx';
import { LocalizationProvider } from '../../../localization/i18n.ts';
import { en } from '../../../localization/locales/en.ts';

const FILE_PATH = 'testing/suites/components/AddItemForm.test.suite.ts';

// A helper component to manage state for the controlled AddItemForm
const StatefulAddItemForm = ({ onAddItem, onClear = () => {} }: { onAddItem: () => void, onClear?: () => void }) => {
    const [value, setValue] = useState('');
    return React.createElement(AddItemForm, { onAddItem, value, onChange: setValue, onClear });
};

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        React.createElement(LocalizationProvider, null, 
            React.createElement(LongPressProvider, null, ui)
        )
    );
};

const testRendersInputAndDisabledButton = async (_user: User) => {
    const { container } = renderWithProvider(React.createElement(StatefulAddItemForm, { onAddItem: () => {} }));
    
    const input = within(container).getByLabelText(en.addItemForm.aria.newItem);
    const button = within(container).getByRole('button', { name: en.addItemForm.aria.add }) as HTMLButtonElement;

    assertEquals(!!input, true, "Input should exist");
    assertEquals(!!button, true, "Button should exist");
    assertEquals(button.disabled, true, "Button should be disabled initially");
};

const testEnablesButtonWithText = async (user: User) => {
    const { container } = renderWithProvider(React.createElement(StatefulAddItemForm, { onAddItem: () => {} }));
    
    const input = within(container).getByLabelText(en.addItemForm.aria.newItem);
    const button = within(container).getByRole('button', { name: en.addItemForm.aria.add }) as HTMLButtonElement;
    
    await user.type(input, 'Cheese');
    
    await waitFor(() => {
        assertEquals(button.disabled, false, "Button should be enabled when text is entered");
    });
};

const testCallsOnAddOnClick = async (user: User) => {
    const handleAddItem = sinon.spy();
    const { container } = renderWithProvider(React.createElement(StatefulAddItemForm, { onAddItem: handleAddItem }));

    const input = within(container).getByLabelText(en.addItemForm.aria.newItem) as HTMLInputElement;
    const button = within(container).getByRole('button', { name: en.addItemForm.aria.add }) as HTMLButtonElement;

    await user.type(input, 'Sausages  ');

    await waitFor(() => {
        assertEquals(button.disabled, false);
    });

    await user.click(button);

    await waitFor(() => {
        assertEquals(handleAddItem.calledOnce, true, "onAddItem should be called once on click");
    });
    
    // The component itself does not clear the input. The parent component is responsible for that.
    assertEquals(input.value, 'Sausages  ');
};

const testDoesNotCallOnAddForWhitespace = async (user: User) => {
    const handleAddItem = sinon.spy();
    const { container } = renderWithProvider(React.createElement(StatefulAddItemForm, { onAddItem: handleAddItem }));

    const input = within(container).getByLabelText(en.addItemForm.aria.newItem);
    const button = within(container).getByRole('button', { name: en.addItemForm.aria.add }) as HTMLButtonElement;
    
    await user.type(input, '   ');

    await waitFor(() => {
      assertEquals(button.disabled, true, "Button should be disabled for only whitespace");
    });
    
    await user.click(button); // user-event does not fire click on disabled elements
    
    assertEquals(handleAddItem.called, false, "onAddItem should not be called for only whitespace");
};

const testCallsOnClearOnEscapeKey = async (user: User) => {
    const handleClear = sinon.spy();
    const { container } = renderWithProvider(React.createElement(StatefulAddItemForm, { onAddItem: () => {}, onClear: handleClear }));

    const input = within(container).getByLabelText(en.addItemForm.aria.newItem);
    await user.type(input, 'some text');
    await user.keyboard('{Escape}');

    await waitFor(() => {
        assertEquals(handleClear.calledOnce, true, "onClear should be called on Escape key press");
    });
};

const testCallsOnClearOnButtonClick = async (user: User) => {
    const handleClear = sinon.spy();
    const { container } = renderWithProvider(React.createElement(StatefulAddItemForm, { onAddItem: () => {}, onClear: handleClear }));

    const input = within(container).getByLabelText(en.addItemForm.aria.newItem);
    await user.type(input, 'some text');

    const clearButton = within(container).getByRole('button', { name: en.addItemForm.aria.clear });
    await user.click(clearButton);

    await waitFor(() => {
        assertEquals(handleClear.calledOnce, true, "onClear should be called on clear button click");
    });
};

export function addItemFormTestSuite() {
    const SUITE_NAME = addItemFormTestSuite.name;
    return [
        runComponentTest('AddItemForm: renders an input and a disabled button', testRendersInputAndDisabledButton, SUITE_NAME, FILE_PATH),
        runComponentTest('AddItemForm: enables the button when text is entered', testEnablesButtonWithText, SUITE_NAME, FILE_PATH),
        runComponentTest('AddItemForm: calls onAddItem on submit and does not clear input', testCallsOnAddOnClick, SUITE_NAME, FILE_PATH),
        runComponentTest('AddItemForm: does not call onAddItem if input is only whitespace', testDoesNotCallOnAddForWhitespace, SUITE_NAME, FILE_PATH),
        runComponentTest('AddItemForm: calls onClear when Escape key is pressed', testCallsOnClearOnEscapeKey, SUITE_NAME, FILE_PATH),
        runComponentTest('AddItemForm: calls onClear when clear button is clicked', testCallsOnClearOnButtonClick, SUITE_NAME, FILE_PATH),
    ];
}