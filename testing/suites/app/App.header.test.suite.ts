const FILE_PATH = 'testing/suites/app/App.header.test.suite.ts';
import React from 'react';
import { render } from '@testing-library/react';
import { within, screen } from '@testing-library/dom';
import App from '../../../App.tsx';
import { runComponentTest, type User } from '../../helpers.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { en } from '../../../localization/locales/en.ts';

const testTogglingShowCheckedClearsSearch = async (user: User) => {
    const { container } = render(React.createElement(App));

    const main = within(container).getByRole('main');
    const input = main.querySelector<HTMLInputElement>('#add-item-input');
    assertEquals(!!input, true, "Add item input should exist");

    await user.type(input!, 'some search term');
    assertEquals(input!.value, 'some search term', 'Input should contain the typed text.');

    const menuButton = container.querySelector('#header-menu-button');
    if (!menuButton) throw new Error("Menu button not found");
    await user.click(menuButton);

    const menuItem = await screen.findByRole('checkbox', { name: en.headerMenu.showCheckedItems });
    await user.click(menuItem);

    assertEquals(input!.value, '', 'Toggling "Show checked items" should clear the search input.');
};

export function appHeaderTestSuite() {
    const SUITE_NAME = appHeaderTestSuite.name;
    return [
        runComponentTest('App Header: toggling show checked items should clear search input', testTogglingShowCheckedClearsSearch, SUITE_NAME, FILE_PATH),
    ];
}