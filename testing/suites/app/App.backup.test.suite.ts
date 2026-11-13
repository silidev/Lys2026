const FILE_PATH = 'testing/suites/app/App.backup.test.suite.ts';
import React from 'react';
import { render } from '@testing-library/react';
import { screen, waitFor, within } from '@testing-library/dom';
import App from '../../../App.tsx';
import { runComponentTest, type User } from '../../helpers.ts';
import type { MockStorageService } from '../../mocks/storageService.mock.ts';
import { assertEquals } from '../../../common/testing/services/tests/helpers.ts';
import { en } from '../../../localization/locales/en.ts';
import type { ShoppingListData } from '../../../types.ts';

import referenceBackup from '../../../data/reference-backup-format.json';

const testRestoreFromReferenceBackup = async (user: User, mockStorage: MockStorageService) => {
    const fn = testRestoreFromReferenceBackup.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    // Start with an empty list
    mockStorage.setItem('shopping-list-data', { items: [], shopCategories: [], homeCategories: [] });
    
    const { container } = render(React.createElement(App));
    
    // Open the menu to find the restore button
    const menuButton = container.querySelector('#header-menu-button');
    if (!menuButton) throw new Error('Menu button not found');
    await user.click(menuButton);
    
    const moreButton = await screen.findByRole('menuitem', { name: en.headerMenu.more });
    await user.click(moreButton);
    
    await screen.findByRole('menuitem', { name: en.headerMenu.restoreFromFile });
    
    // The restore button clicks a hidden file input. In a test, we can directly
    // target the hidden input and trigger the upload event on it.
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    if (!fileInput) throw new Error('File input for restore not found');
    
    const fileContent = JSON.stringify(referenceBackup);
    const file = new File([fileContent], 'reference-backup-format.json', { type: 'application/json' });
    
    await user.upload(fileInput, file);

    const confirmModal = await screen.findByRole('dialog', { name: en.confirmModal.restore.title });
    assertEquals(!!confirmModal, true, 'Confirmation modal for restore should appear.');

    const confirmButton = within(confirmModal).getByRole('button', { name: en.confirmModal.restore.confirm });
    await user.click(confirmButton);

    await waitFor(() => {
        const categoryHeading = screen.getByRole('heading', { name: 'Reference Home Category' });
        assertEquals(!!categoryHeading, true, 'Restored home category should be visible.');
        
        const item = screen.getByText('Reference Item');
        assertEquals(!!item, true, 'Restored item should be visible in home view.');
    });

    await user.click(within(container).getByRole('tab', { name: en.modeSwitcher.shop }));

    await waitFor(() => {
        const categoryHeading = screen.getByRole('heading', { name: 'Reference Shop Category' });
        assertEquals(!!categoryHeading, true, 'Restored shop category should be visible.');
        
        const item = screen.getByText('Ref Shop Item');
        assertEquals(!!item, true, 'Restored item should be visible in shop view.');
    });

    const restoredData = mockStorage.getItem<ShoppingListData>(
        'shopping-list-data'
    );
    const item1 = restoredData?.items.find(
        i => i.id === 'ref-item-1'
    );
    const item2 = restoredData?.items.find(
        i => i.id === 'ref-item-2'
    );
    assertEquals(item1?.isUrgent, false, ctx);
    assertEquals(item1?.isUrgentOnce, false, ctx);
    assertEquals(item2?.isUrgent, true, ctx);
    assertEquals(item2?.isUrgentOnce, false, ctx);

    const urgentToggle = container.querySelector(
        '#urgent-toggle-button'
    );
    if (!urgentToggle) {
        throw new Error('Urgent toggle button not found');
    }
    await user.click(urgentToggle);

    await waitFor(() => {
        assertEquals(
            !!container.querySelector('#item-name-ref-item-2'),
            true,
            ctx
        );
        assertEquals(
            container.querySelector('#item-name-ref-item-1'),
            null,
            ctx
        );
    });
};

export function appBackupTestSuite() {
    const SUITE_NAME = appBackupTestSuite.name;
    return [
        runComponentTest(
            'App Restore: should correctly restore data from a reference backup file',
            testRestoreFromReferenceBackup,
            SUITE_NAME,
            FILE_PATH
        ),
    ];
}