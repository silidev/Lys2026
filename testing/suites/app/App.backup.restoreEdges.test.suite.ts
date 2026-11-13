const FILE_PATH =
    'testing/suites/app/App.backup.restoreEdges.test.suite.ts';
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
import type {
    OldShoppingListDataWithSections,
    ShoppingListData,
    ShoppingListItem,
} from '../../../types.ts';

const uploadAndConfirmRestore = async (
    user: User,
    container: HTMLElement,
    fileContent: string,
    fileName: string
) => {
    const fileInput = container.querySelector(
        'input[type="file"]'
    ) as HTMLInputElement | null;
    if (!fileInput) throw new Error('File input missing');
    const file = new File([fileContent], fileName, {
        type: 'application/json',
    });
    await user.upload(fileInput, file);
    const modal = await screen.findByRole('dialog', {
        name: en.confirmModal.restore.title,
    });
    await user.click(
        within(modal).getByRole('button', {
            name: en.confirmModal.restore.confirm,
        })
    );
};

const testRestoreLegacySectionsAndCancel = async (
    user: User,
    mockStorage: MockStorageService
) => {
    const fn = testRestoreLegacySectionsAndCancel.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    const existing: ShoppingListData = {
        items: [{ id: 'keep-1', name: 'Keep Item', amount: '1' }],
        shopCategories: [
            { id: 's0', name: 'Uncategorized', itemIds: ['keep-1'] },
        ],
        homeCategories: [
            { id: 'h0', name: 'Uncategorized', itemIds: ['keep-1'] },
        ],
    };
    mockStorage.setItem('shopping-list-data', existing);

    const { container } = render(React.createElement(App));
    const fileInput = container.querySelector(
        'input[type="file"]'
    ) as HTMLInputElement | null;
    if (!fileInput) throw new Error('File input missing');

    const legacy: OldShoppingListDataWithSections = {
        items: [
            {
                id: 'sec-1',
                name: 'Section Item',
                amount: '1',
                isUrgent: true,
            },
        ],
        shopSections: [
            { id: 'ss1', name: 'Shop Sec', itemIds: ['sec-1'] },
        ],
        homeSections: [
            { id: 'hs1', name: 'Home Sec', itemIds: ['sec-1'] },
        ],
    };

    const file = new File(
        [JSON.stringify(legacy)],
        'legacy.json',
        { type: 'application/json' }
    );
    await user.upload(fileInput, file);
    const modal = await screen.findByRole('dialog', {
        name: en.confirmModal.restore.title,
    });
    await user.click(
        within(modal).getByRole('button', {
            name: en.confirmModal.cancel,
        })
    );

    const afterCancel = mockStorage.getItem<ShoppingListData>(
        'shopping-list-data'
    );
    assertEquals(
        afterCancel?.items[0]?.id,
        'keep-1',
        `${ctx}: cancel preserves existing data`
    );

    await uploadAndConfirmRestore(
        user,
        container,
        JSON.stringify(legacy),
        'legacy2.json'
    );
    await waitFor(() => {
        assertEquals(
            !!container.querySelector('#item-name-sec-1'),
            true,
            `${ctx}: sections format restored`
        );
    });
};

const testRestoreItemArrayFormat = async (
    user: User,
    mockStorage: MockStorageService
) => {
    const fn = testRestoreItemArrayFormat.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    mockStorage.setItem('shopping-list-data', {
        items: [],
        shopCategories: [],
        homeCategories: [],
    });
    const { container } = render(React.createElement(App));
    const itemsOnly: ShoppingListItem[] = [
        { id: 'arr-1', name: 'Array Item', amount: '2' },
    ];
    await uploadAndConfirmRestore(
        user,
        container,
        JSON.stringify(itemsOnly),
        'items.json'
    );
    await waitFor(() => {
        assertEquals(
            !!container.querySelector('#item-name-arr-1'),
            true,
            `${ctx}: array item restored`
        );
    });
};

export function appBackupRestoreEdgesTestSuite() {
    const SUITE = appBackupRestoreEdgesTestSuite.name;
    return [
        runComponentTest(
            'App Restore: sections format and cancel preservation',
            testRestoreLegacySectionsAndCancel,
            SUITE,
            FILE_PATH
        ),
        runComponentTest(
            'App Restore: array-only format restores',
            testRestoreItemArrayFormat,
            SUITE,
            FILE_PATH
        ),
    ];
}
