const FILE_PATH =
    'testing/suites/app/App.backup.restoreErrors.test.suite.ts';
import React from 'react';
import { render } from '@testing-library/react';
import { screen, waitFor, within } from '@testing-library/dom';
import App from '../../../App.tsx';
import { runComponentTest, type User } from '../../helpers.ts';
import type {
    MockStorageService,
} from '../../mocks/storageService.mock.ts';
import {
    assertEquals,
} from '../../../common/testing/services/tests/helpers.ts';
import { en } from '../../../localization/locales/en.ts';
import type { ShoppingListData } from '../../../types.ts';

const testInvalidRestoreShowsErrorModal = async (
    user: User,
    mockStorage: MockStorageService
) => {
    const fn = testInvalidRestoreShowsErrorModal.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    const existing: ShoppingListData = {
        items: [{ id: 'k-1', name: 'Safe Item', amount: '1' }],
        shopCategories: [
            { id: 's0', name: 'Uncategorized', itemIds: ['k-1'] },
        ],
        homeCategories: [
            { id: 'h0', name: 'Uncategorized', itemIds: ['k-1'] },
        ],
    };
    mockStorage.setItem('shopping-list-data', existing);

    const { container } = render(React.createElement(App));
    const fileInput = container.querySelector(
        'input[type="file"]'
    ) as HTMLInputElement | null;
    if (!fileInput) throw new Error('File input missing');

    const badFile = new File(['{broken json'], 'bad.json', {
        type: 'application/json',
    });
    await user.upload(fileInput, badFile);

    const errorDialog = await screen.findByRole('alertdialog', {
        name: en.errorModal.restoreTitle,
    });
    assertEquals(!!errorDialog, true, `${ctx}: error modal shown`);

    const msgEl = within(errorDialog)
        .getByText(/Invalid JSON/i);
    assertEquals(!!msgEl, true, `${ctx}: details shown`);

    const closeBtn = errorDialog.querySelector(
        '#error-modal-close-button'
    ) as HTMLButtonElement | null;
    if (!closeBtn) throw new Error('Close button missing');
    await user.click(closeBtn);

    await waitFor(() => {
        assertEquals(
            screen.queryByRole('alertdialog', {
                name: en.errorModal.restoreTitle,
            }),
            null,
            `${ctx}: error modal dismissed`
        );
    });
    assertEquals(
        mockStorage.getItem<ShoppingListData>('shopping-list-data')
            ?.items[0]?.id,
        'k-1',
        `${ctx}: existing data untouched`
    );
};

const testRestoreWithUnknownFieldsShowsWarning = async (
    user: User,
    mockStorage: MockStorageService
) => {
    const fn = testRestoreWithUnknownFieldsShowsWarning.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    mockStorage.setItem('shopping-list-data', {
        items: [],
        shopCategories: [],
        homeCategories: [],
    });

    const { container } = render(React.createElement(App));
    const fileInput = container.querySelector(
        'input[type="file"]'
    ) as HTMLInputElement | null;
    if (!fileInput) throw new Error('File input missing');

    const payload = JSON.stringify({
        items: [{ id: 'r-1', name: 'Milk', isRush: true }],
        shopCategories: [
            { id: 's1', name: 'Fridge', itemIds: ['r-1'] },
        ],
        homeCategories: [
            { id: 'h1', name: 'Fridge', itemIds: ['r-1'] },
        ],
    });
    const file = new File([payload], 'legacy-rush.json', {
        type: 'application/json',
    });
    await user.upload(fileInput, file);

    const confirmDialog = await screen.findByRole('dialog', {
        name: en.confirmModal.restore.title,
    });
    const warningBox = confirmDialog.querySelector(
        '#restore-unknown-fields-warning'
    );
    assertEquals(!!warningBox, true, `${ctx}: warning box shown`);
    assertEquals(
        warningBox?.textContent?.includes('isRush'),
        true,
        `${ctx}: warns about isRush`
    );
};

export function appBackupRestoreErrorsTestSuite() {
    const SUITE = appBackupRestoreErrorsTestSuite.name;
    return [
        runComponentTest(
            'App Restore: invalid file opens prominent ErrorModal',
            testInvalidRestoreShowsErrorModal,
            SUITE,
            FILE_PATH
        ),
        runComponentTest(
            'App Restore: unknown fields show big warning',
            testRestoreWithUnknownFieldsShowsWarning,
            SUITE,
            FILE_PATH
        ),
    ];
}
