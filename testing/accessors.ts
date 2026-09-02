const FILE_PATH = 'testing/accessors.ts';
import type { User } from './helpers.ts';
import { screen } from '@testing-library/dom';
import { en } from '../localization/locales/en.ts';

/**
 * A test utility to ensure the "Show checked" button is active (pressed),
 * which means completed items are visible.
 * If it's not active, it will be clicked.
 * @param user The user-event instance.
 * @param container The container element to search within.
 */
export const ensureShowCheckedItemsIsChecked = async (user: User, container: HTMLElement): Promise<void> => {
    const menuButton = container.querySelector('#header-menu-button');
    if (!menuButton) {
        throw new Error("Could not find header menu button");
    }
    await user.click(menuButton);

    const checkbox = await screen.findByRole('checkbox', { name: en.headerMenu.showCheckedItems });
    if (!(checkbox instanceof HTMLInputElement)) {
        throw new Error("Found element is not an input checkbox");
    }

    if (!checkbox.checked) {
        await user.click(checkbox);
    }

    // Close the menu so the rest of the test can proceed
    await user.click(menuButton);
};