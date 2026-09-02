const FILE_PATH = 'testing/suites/components/HeaderMenu.test.suite.ts';
import React from 'react';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import App from '../../../App.tsx';
import { runComponentTest, type User } from '../../helpers.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { en } from '../../../localization/locales/en.ts';

const testMenuItemClickTriggersAction = async (user: User) => {
    const { container } = render(React.createElement(App));

    // 1. Open the header menu by clicking the menu button.
    const menuButton = container.querySelector('#header-menu-button');
    if (!menuButton) {
        throw new Error('Could not find header menu button by ID');
    }
    await user.click(menuButton);

    // 2. Wait for the menu to be open and find the "Settings" item.
    // The button has the text, but we select by role + text to find the clickable element.
    const settingsMenuItem = await screen.findByRole('menuitem', { name: en.headerMenu.settings });
    assertEquals(!!settingsMenuItem, true, "Settings menu item should be visible.");

    // 3. Click the "Settings" menu item.
    await user.click(settingsMenuItem);

    // 4. Assert that the settings modal has opened.
    await waitFor(() => {
        const settingsModal = screen.getByRole('dialog', { name: en.settingsModal.title });
        assertEquals(!!settingsModal, true, "Settings modal should open after clicking the menu item.");
    });
};


export function headerMenuTestSuite() {
    const SUITE_NAME = headerMenuTestSuite.name;
    return [
        runComponentTest('HeaderMenu: should trigger item action on click and open modal', testMenuItemClickTriggersAction, SUITE_NAME, FILE_PATH),
    ];
}