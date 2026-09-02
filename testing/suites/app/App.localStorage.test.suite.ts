const FILE_PATH = 'testing/suites/app/App.localStorage.test.suite.ts';
import React from 'react';
import { render } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import App from '../../../App.tsx';
import { runComponentTest, type User } from '../../helpers.ts';
import type { MockStorageService } from '../../mocks/storageService.mock.ts';
import { assert, assertEquals } from '../../../common/testing/services/tests/helpers.ts';

import referenceLocalStorage from '../../../data/reference-localstorage-format.json';

const testLocalStorageFormatMatchesReference = async (_user: User, mockStorage: MockStorageService) => {
    // 2. Render the app. With the fixed hook, this will populate mockStorage.
    render(React.createElement(App));
    
    // Wait for app to initialize and write to storage.
    await waitFor(() => {
        const theme = mockStorage.getItem('theme');
        if (!theme) throw new Error('App not initialized yet');
    });

    const referenceKeys = Object.keys(referenceLocalStorage).sort();
    const actualKeys = mockStorage.getAllKeys().sort();

    assertEquals(actualKeys, referenceKeys, `The set of localStorage keys does not match the reference format.`);

    for (const key of referenceKeys) {
        const actualRawValue = mockStorage.getRawItem(key)!;
        const referenceRawValue = (referenceLocalStorage as Record<string, string>)[key];
        
        const actualParsed = JSON.parse(actualRawValue);
        const referenceParsed = JSON.parse(referenceRawValue);

        const actualType = typeof actualParsed;
        const referenceType = typeof referenceParsed;
        
        assert(actualType === referenceType, `Type mismatch for key "${key}". Expected ${referenceType}, got ${actualType}.`);

        if (referenceType === 'object' && referenceParsed !== null && !Array.isArray(referenceParsed)) {
            const referenceObjKeys = Object.keys(referenceParsed).sort();
            const actualObjKeys = Object.keys(actualParsed).sort();
            assertEquals(actualObjKeys, referenceObjKeys, `Object keys for localStorage key "${key}" do not match reference.`);
        }
    }
};

export function appLocalStorageTestSuite() {
    const SUITE_NAME = appLocalStorageTestSuite.name;
    return [
        runComponentTest(
            'App LocalStorage: format should match reference file on initial load',
            testLocalStorageFormatMatchesReference,
            SUITE_NAME,
            FILE_PATH
        ),
    ];
}
