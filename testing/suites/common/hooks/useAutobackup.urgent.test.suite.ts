const FILE_PATH =
    'testing/suites/common/hooks/useAutobackup.urgent.test.suite.ts';
import { renderHook } from '@testing-library/react';
import sinon from 'sinon';
import {
    useAutobackup,
} from '../../../../common/hooks/useAutobackup.ts';
import { runLogicTest } from '../../../helpers.ts';
import type {
    MockStorageService,
} from '../../../mocks/storageService.mock.ts';
import {
    assertEquals,
} from '../../../../common/testing/services/tests/helpers.ts';
import type { ShoppingListData } from '../../../../types.ts';
import {
    assertItemUrgentFlags,
    getDownloadStub,
    readBlobText,
} from '../../services/backupTestHelpers.ts';

const testAutobackupSerializesUrgentFlags = async (
    mockStorage: MockStorageService
) => {
    const fn = testAutobackupSerializesUrgentFlags.name;
    const ctx = `${fn} in ${FILE_PATH}`;
    const sandbox = sinon.createSandbox();
    const now = Date.now();
    sandbox.useFakeTimers({
        now,
        toFake: ['Date', 'setInterval', 'clearInterval'],
    });
    const downloadStub = getDownloadStub();
    downloadStub.resetHistory();

    const backupData: ShoppingListData = {
        items: [
            {
                id: 'ab-1',
                name: 'Butter',
                amount: '1',
                isUrgent: true,
                isUrgentOnce: true,
            },
            {
                id: 'ab-2',
                name: 'Salt',
                amount: '1',
                isUrgent: false,
                isUrgentOnce: false,
            },
        ],
        shopCategories: [
            { id: 's1', name: 'Fridge', itemIds: ['ab-1', 'ab-2'] },
        ],
        homeCategories: [
            { id: 'h1', name: 'Fridge', itemIds: ['ab-1', 'ab-2'] },
        ],
    };

    const options = {
        filenamePrefix: 'urgent-test',
        timestampKey: 'urgent-test-ts',
    };

    try {
        mockStorage.setItem(
            options.timestampKey,
            now - 2 * 60 * 60 * 1000
        );
        const { unmount } = renderHook(() =>
            useAutobackup(1, () => backupData, options)
        );
        assertEquals(downloadStub.calledOnce, true, ctx);

        const blob = downloadStub.firstCall.args[0] as Blob;
        const text = await readBlobText(blob);
        const parsed = JSON.parse(text) as ShoppingListData;

        assertItemUrgentFlags(parsed.items[0], true, true, ctx);
        assertItemUrgentFlags(parsed.items[1], false, false, ctx);
        unmount();
    } finally {
        sandbox.restore();
    }
};

export function useAutobackupUrgentTestSuite() {
    const SUITE = useAutobackupUrgentTestSuite.name;
    return [
        runLogicTest(
            'Autobackup serializes urgent flags in Blob',
            testAutobackupSerializesUrgentFlags,
            SUITE,
            FILE_PATH
        ),
    ];
}
