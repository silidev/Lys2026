const FILE_PATH =
    'testing/suites/app/App.backup.urgent.test.suite.ts';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
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
import {
    assertItemsUrgentFlags,
    getDownloadStub,
    readBlobText,
    type UrgentExpectation,
} from '../services/backupTestHelpers.ts';

const testAppExportAndRestorePreservesUrgentFlags = async (
    user: User,
    mockStorage: MockStorageService
) => {
    const fn = testAppExportAndRestorePreservesUrgentFlags.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    const downloadStub = getDownloadStub();
    downloadStub.resetHistory();

    const expectedFlags: UrgentExpectation[] = [
        { id: 'u-1', isUrgent: true, isUrgentOnce: false },
        { id: 'u-2', isUrgent: false, isUrgentOnce: true },
        { id: 'u-3', isUrgent: false, isUrgentOnce: false },
    ];
    const initialData: ShoppingListData = {
        items: [
            {
                id: 'u-1',
                name: 'Urgent Always Item',
                amount: '1',
                isUrgent: true,
                isUrgentOnce: false,
            },
            {
                id: 'u-2',
                name: 'Urgent Once Item',
                amount: '1',
                isUrgent: false,
                isUrgentOnce: true,
            },
            {
                id: 'u-3',
                name: 'Normal Item',
                amount: '1',
                isUrgent: false,
                isUrgentOnce: false,
            },
        ],
        shopCategories: [
            { id: 's-1', name: 'Shop', itemIds: ['u-1', 'u-2', 'u-3'] },
        ],
        homeCategories: [
            { id: 'h-1', name: 'Home', itemIds: ['u-1', 'u-2', 'u-3'] },
        ],
    };
    mockStorage.setItem('shopping-list-data', initialData);

    const firstRender = render(React.createElement(App));
    const menuBtn1 = firstRender.container.querySelector(
        '#header-menu-button'
    );
    if (!menuBtn1) throw new Error('Menu button not found');
    await user.click(menuBtn1);
    await user.click(
        await screen.findByRole('menuitem', {
            name: en.headerMenu.more,
        })
    );
    await user.click(
        await screen.findByRole('menuitem', {
            name: en.headerMenu.backupNow,
        })
    );

    assertEquals(downloadStub.calledOnce, true, ctx);
    const exportedJson = await readBlobText(
        downloadStub.firstCall.args[0] as Blob
    );
    const exported = JSON.parse(exportedJson) as ShoppingListData;
    assertItemsUrgentFlags(exported.items, expectedFlags, ctx);

    cleanup();
    mockStorage.clear();
    mockStorage.setItem('shopping-list-data', {
        items: [],
        shopCategories: [],
        homeCategories: [],
    });

    const { container } = render(React.createElement(App));
    const fileInput = container.querySelector(
        'input[type="file"]'
    ) as HTMLInputElement | null;
    if (!fileInput) throw new Error('File input not found');

    const file = new File([exportedJson], 'backup.json', {
        type: 'application/json',
    });
    await user.upload(fileInput, file);

    const dialog = await screen.findByRole('dialog', {
        name: en.confirmModal.restore.title,
    });
    await user.click(
        within(dialog).getByRole('button', {
            name: en.confirmModal.restore.confirm,
        })
    );

    await waitFor(() => {
        assertEquals(
            !!container.querySelector('#item-name-u-1'),
            true,
            ctx
        );
    });

    const restored = mockStorage.getItem<ShoppingListData>(
        'shopping-list-data'
    );
    assertItemsUrgentFlags(
        restored?.items ?? [],
        expectedFlags,
        ctx
    );

    const urgentToggle = container.querySelector(
        '#urgent-toggle-button'
    );
    if (!urgentToggle) throw new Error('Urgent toggle missing');
    await user.click(urgentToggle);

    await waitFor(() => {
        assertEquals(
            !!container.querySelector('#item-name-u-1'),
            true,
            ctx
        );
        assertEquals(
            !!container.querySelector('#item-name-u-2'),
            true,
            ctx
        );
        assertEquals(
            container.querySelector('#item-name-u-3'),
            null,
            ctx
        );
    });
};

export function appBackupUrgentTestSuite() {
    const SUITE_NAME = appBackupUrgentTestSuite.name;
    return [
        runComponentTest(
            'App Backup/Restore: preserves urgent flags',
            testAppExportAndRestorePreservesUrgentFlags,
            SUITE_NAME,
            FILE_PATH
        ),
    ];
}
