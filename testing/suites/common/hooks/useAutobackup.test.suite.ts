

const FILE_PATH = 'testing/suites/common/hooks/useAutobackup.test.suite.ts';
import { renderHook } from '@testing-library/react';
import sinon from 'sinon';
import { useAutobackup } from '../../../../common/hooks/useAutobackup.ts';
import { runLogicTest } from '../../../helpers.ts';
import type { MockStorageService } from '../../../mocks/storageService.mock.ts';
import downloaderService from '../../../../common/services/downloader.ts';
import type { ShoppingListData } from '../../../../types.ts';
import { assertEquals } from '../../../../common/testing/services/tests/helpers.ts';

const getDownloadStub = (): sinon.SinonStub => {
    const stub = (downloaderService as unknown as { _downloadBlobStub: sinon.SinonStub })._downloadBlobStub;
    if (!stub) {
        throw new Error("Downloader service stub not found. It should be attached in the test helper.");
    }
    return stub;
};

const getBackupData = (): ShoppingListData => ({
    items: [{ id: '1', name: 'Test Item', amount: '1' }],
    shopCategories: [],
    homeCategories: [],
});

const options = {
    filenamePrefix: 'test-prefix',
    timestampKey: 'test-timestamp-key'
};

const testDoesNothingIfIntervalIsZero = (_mockStorage: MockStorageService) => {
    const downloadStub = getDownloadStub();
    downloadStub.resetHistory();

    const { unmount } = renderHook(() => useAutobackup(0, getBackupData, options));
    assertEquals(downloadStub.called, false, "Download stub should not be called when interval is 0");
    unmount();
};

const testDoesNotTriggerBackupOnFirstRun = (mockStorage: MockStorageService) => {
    const sandbox = sinon.createSandbox();
    const now = Date.now();
    sandbox.useFakeTimers({ now }); // Control Date.now()
    const downloadStub = getDownloadStub();
    downloadStub.resetHistory();
    
    try {
        mockStorage.removeItem(options.timestampKey); // Ensure no previous backup
        const { unmount } = renderHook(() => useAutobackup(1, getBackupData, options));
        // The hook calls checkBackup on mount, which should initialize the timestamp but not trigger a backup.
        assertEquals(downloadStub.called, false, "Backup should NOT run on first load");
        assertEquals(mockStorage.getItem(options.timestampKey), now, "Timestamp should be initialized on first run");
        unmount();
    } finally {
        sandbox.restore();
    }
};


const testTriggersBackupWhenIntervalPasses = (mockStorage: MockStorageService) => {
    const sandbox = sinon.createSandbox();
    const now = Date.now();
    const clock = sandbox.useFakeTimers({
        now,
        toFake: ['Date', 'setInterval', 'clearInterval']
    });
    const downloadStub = getDownloadStub();
    downloadStub.resetHistory();
    try {
        const twoHoursAgo = now - (2 * 60 * 60 * 1000);
        mockStorage.setItem(options.timestampKey, twoHoursAgo);

        const { unmount } = renderHook(() => useAutobackup(1, getBackupData, options));
        
        assertEquals(downloadStub.calledOnce, true, "Backup should trigger on initial check");

        downloadStub.resetHistory();
        
        // At 'now', backup runs, timestamp becomes 'now'.
        // Interval is 1 hour. It fires at 'now + 1h'. Check is (now+1h) - now > 1h, which is false. No backup.
        // Next interval fires at 'now + 2h'. Check is (now+2h) - now > 1h, which is true. Backup runs.
        clock.tick(2 * 60 * 60 * 1000); 
        assertEquals(downloadStub.calledOnce, true, "Backup should trigger on interval after 2 hours");

        unmount();
    } finally {
        sandbox.restore();
    }
};

const testDoesNotBackupEmptyList = (mockStorage: MockStorageService) => {
    const sandbox = sinon.createSandbox();
    const now = Date.now();
    sandbox.useFakeTimers({
        now,
        toFake: ['Date', 'setInterval', 'clearInterval']
    });
    const downloadStub = getDownloadStub();
    downloadStub.resetHistory();
    try {
        const twoHoursAgo = now - (2 * 60 * 60 * 1000);
        mockStorage.setItem(options.timestampKey, twoHoursAgo);

        const { unmount } = renderHook(() => useAutobackup(1, () => ({ items: [], shopCategories: [], homeCategories: [] }), options));
        
        assertEquals(downloadStub.called, false, "Backup should not be called for an empty list");
        unmount();
    } finally {
        sandbox.restore();
    }
};


export function useAutobackupTestSuite() {
    const SUITE_NAME = useAutobackupTestSuite.name;
    return [
        runLogicTest('useAutobackup: should do nothing if interval is zero', testDoesNothingIfIntervalIsZero, SUITE_NAME, FILE_PATH),
        runLogicTest('useAutobackup: should not trigger backup on first run, but initialize timestamp', testDoesNotTriggerBackupOnFirstRun, SUITE_NAME, FILE_PATH),
        runLogicTest('useAutobackup: should trigger backup when interval has passed', testTriggersBackupWhenIntervalPasses, SUITE_NAME, FILE_PATH),
        runLogicTest('useAutobackup: should not trigger backup for an empty list', testDoesNotBackupEmptyList, SUITE_NAME, FILE_PATH),
    ];
}