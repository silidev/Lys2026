// testing/helpers.ts
import { runTest as baseRunTest } from '../common/testing/services/tests/helpers.ts';
import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sinon from 'sinon';
import * as storageServiceModule from '../common/services/storageService.ts';
import { MockStorageService } from './mocks/storageService.mock.ts';
import downloaderService from '../common/services/downloader.ts';

declare global {
    interface Window {
      __initialRunLogicHasStarted?: boolean;
    }
}

export type User = ReturnType<typeof userEvent.setup>;
type ComponentTestFn = (user: User, mockStorage: MockStorageService) => Promise<void> | void;
type LogicTestFn = (mockStorage: MockStorageService) => Promise<void> | void;

// Create a single sandbox that will be used and restored for each test.
const sandbox = sinon.createSandbox();

const runTestWithSetup = (
    name: string,
    testFn: ComponentTestFn | LogicTestFn,
    isComponentTest: boolean,
    suiteName?: string,
    fileName?: string
) => {
    return baseRunTest(name, async () => {
        // Restore any previous stubs before creating new ones for this test.
        // This is a safeguard against test failures that might prevent cleanup.
        sandbox.restore();

        // This flag prevents the app's automatic test runner from starting during a test run.
        window.__initialRunLogicHasStarted = true;

        const mockStorage = new MockStorageService();
        sandbox.stub(storageServiceModule.default, 'getItem').callsFake(mockStorage.getItem.bind(mockStorage));
        sandbox.stub(storageServiceModule.default, 'setItem').callsFake(mockStorage.setItem.bind(mockStorage));
        sandbox.stub(storageServiceModule.default, 'removeItem').callsFake(mockStorage.removeItem.bind(mockStorage));
        sandbox.stub(storageServiceModule.default, 'clear').callsFake(mockStorage.clear.bind(mockStorage));
        sandbox.stub(storageServiceModule.default, 'getAllKeys').callsFake(mockStorage.getAllKeys.bind(mockStorage));
        sandbox.stub(storageServiceModule.default, 'getRawItem').callsFake(mockStorage.getRawItem.bind(mockStorage));

        (downloaderService as unknown as { _downloadBlobStub: sinon.SinonStub })._downloadBlobStub = sandbox.stub(downloaderService, 'downloadBlob');
        
        // Reset and stub UUID generation for deterministic tests
        (globalThis as any).__uuid_counter__ = 0;
        sandbox.stub(crypto, 'randomUUID').callsFake(() => {
            const id = `00000000-0000-4000-a000-${(++(globalThis as any).__uuid_counter__).toString().padStart(12, '0')}`;
            return id as `${string}-${string}-${string}-${string}-${string}`;
        });
        
        sandbox.stub(window, 'matchMedia').returns({
            matches: true,
            media: '(prefers-color-scheme: dark)',
            onchange: null,
            addListener: sandbox.spy(),
            removeListener: sandbox.spy(),
            addEventListener: sandbox.spy(),
            removeEventListener: sandbox.spy(),
            dispatchEvent: () => true,
        } as unknown as MediaQueryList);
        
        sandbox.stub(window, 'alert').callsFake(() => {});
        
        const originalSpeechSynthesis = window.speechSynthesis;
        Object.defineProperty(window, 'speechSynthesis', {
            value: {
                speak: sandbox.spy(),
                cancel: sandbox.spy(),
                getVoices: () => [{ lang: 'fr-FR', name: 'Test Voice'}] as SpeechSynthesisVoice[],
            },
            configurable: true,
            writable: true,
        });

        const user = isComponentTest ? userEvent.setup() : null;

        try {
            if (isComponentTest) {
                await (testFn as ComponentTestFn)(user!, mockStorage);
            } else {
                await (testFn as LogicTestFn)(mockStorage);
            }
        } finally {
            // Teardown
            if (isComponentTest) {
                cleanup();
            }
            sandbox.restore();
            delete (downloaderService as { _downloadBlobStub?: sinon.SinonStub })._downloadBlobStub;
            if ('__initialRunLogicHasStarted' in window) {
                delete window.__initialRunLogicHasStarted;
            }
            if ('__uuid_counter__' in globalThis) {
                delete (globalThis as any).__uuid_counter__;
            }
            Object.defineProperty(window, 'speechSynthesis', {
                value: originalSpeechSynthesis,
                configurable: true,
            });
        }
    }, testFn.name, suiteName, fileName);
};

export const runComponentTest = (name: string, testFn: ComponentTestFn, suiteName?: string, fileName?: string) => {
    return runTestWithSetup(name, testFn, true, suiteName, fileName);
};

export const runLogicTest = (name: string, testFn: LogicTestFn, suiteName?: string, fileName?: string) => {
    return runTestWithSetup(name, testFn, false, suiteName, fileName);
};