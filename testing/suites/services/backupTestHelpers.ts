const FILE_PATH =
    'testing/suites/services/backupTestHelpers.ts';
import sinon from 'sinon';
import downloaderService
    from '../../../common/services/downloader.ts';
import {
    assertEquals,
} from '../../../common/testing/services/tests/helpers.ts';
import type { ShoppingListItem } from '../../../types.ts';

interface DownloaderWithStub {
    _downloadBlobStub?: sinon.SinonStub;
}

export const getDownloadStub = (): sinon.SinonStub => {
    const stub = (
        downloaderService as DownloaderWithStub
    )._downloadBlobStub;
    if (!stub) {
        throw new Error('Downloader stub not found.');
    }
    return stub;
};

export const readBlobText = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Expected string Blob'));
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
    });

export const assertItemUrgentFlags = (
    actual: ShoppingListItem | undefined,
    expectedUrgent: boolean | undefined,
    expectedUrgentOnce: boolean | undefined,
    ctx: string
) => {
    assertEquals(!!actual, true, `${ctx}: item exists`);
    assertEquals(
        actual?.isUrgent,
        expectedUrgent,
        `${ctx}: isUrgent`
    );
    assertEquals(
        actual?.isUrgentOnce,
        expectedUrgentOnce,
        `${ctx}: isUrgentOnce`
    );
};

export interface UrgentExpectation {
    id: string;
    isUrgent: boolean | undefined;
    isUrgentOnce: boolean | undefined;
}

export const assertItemsUrgentFlags = (
    items: ShoppingListItem[],
    expected: UrgentExpectation[],
    ctx: string
) => {
    const byId = new Map(items.map(i => [i.id, i]));
    for (const exp of expected) {
        assertItemUrgentFlags(
            byId.get(exp.id),
            exp.isUrgent,
            exp.isUrgentOnce,
            ctx
        );
    }
};
