const FILE_PATH =
  'testing/suites/services/localStorageMigration.test.suite.ts';
import {
  migrateAndAuditLocalStorage,
} from '../../../common/services/localStorageMigrationService.ts';
import { runLogicTest } from '../../helpers.ts';
import type {
  MockStorageService,
} from '../../mocks/storageService.mock.ts';
import {
  assertEquals,
} from '../../../common/testing/services/tests/helpers.ts';

const testVendorKeysIgnoredAndUnknownAppKeysRemoved = (
  mockStorage: MockStorageService
) => {
  const fn = testVendorKeysIgnoredAndUnknownAppKeysRemoved.name;
  const ctx = `${fn} in ${FILE_PATH}`;
  mockStorage.clear();
  mockStorage.setRawItem('vendor-analytics-id', '"v-123"');
  mockStorage.setRawItem('firebase:host:app', 'plain-value');
  mockStorage.setItem('shopping-list-obsolete-flag', true);
  mockStorage.setItem('lys-old-temp', { x: 1 });
  mockStorage.setItem('theme', 'dark');

  const res = migrateAndAuditLocalStorage();
  assertEquals(
    mockStorage.getRawItem('vendor-analytics-id'),
    '"v-123"',
    `${ctx}: vendor key preserved`
  );
  assertEquals(
    mockStorage.getRawItem('firebase:host:app'),
    'plain-value',
    `${ctx}: firebase vendor key preserved`
  );
  assertEquals(
    mockStorage.getRawItem('shopping-list-obsolete-flag'),
    null,
    `${ctx}: unknown shopping-list-* key deleted`
  );
  assertEquals(
    mockStorage.getRawItem('lys-old-temp'),
    null,
    `${ctx}: unknown lys-* key deleted`
  );
  assertEquals(
    res.findings.some((f) => f.message.includes('vendor')),
    false,
    `${ctx}: vendor key never shown in modal findings`
  );
  assertEquals(
    res.findings.length,
    2,
    `${ctx}: two unknown app keys reported`
  );
};

const testInvalidSettingsRemovedAndValidKept = (
  mockStorage: MockStorageService
) => {
  const fn = testInvalidSettingsRemovedAndValidKept.name;
  const ctx = `${fn} in ${FILE_PATH}`;
  mockStorage.clear();
  mockStorage.setItem('theme', 'purple');
  mockStorage.setItem('shopping-list-autobackup-interval-h', -5);
  mockStorage.setItem('shopping-list-advanced-mode', 'yes');
  mockStorage.setItem('lys-last-manual-backup-timestamp', 'bad');
  mockStorage.setRawItem('shopping-list-hide-completed', '{bad');
  mockStorage.setItem('shopping-list-enable-split-item-names', true);
  mockStorage.setItem('disableRunningUiTestsOnDesktopLoadOnce', true);

  const res = migrateAndAuditLocalStorage();
  assertEquals(mockStorage.getRawItem('theme'), null, `${ctx}: theme`);
  assertEquals(
    mockStorage.getRawItem('shopping-list-autobackup-interval-h'),
    null,
    `${ctx}: negative interval`
  );
  assertEquals(
    mockStorage.getRawItem('shopping-list-advanced-mode'),
    null,
    `${ctx}: non-boolean advanced`
  );
  assertEquals(
    mockStorage.getRawItem('lys-last-manual-backup-timestamp'),
    null,
    `${ctx}: bad timestamp`
  );
  assertEquals(
    mockStorage.getRawItem('shopping-list-hide-completed'),
    null,
    `${ctx}: corrupt setting JSON`
  );
  assertEquals(
    mockStorage.getItem('shopping-list-enable-split-item-names'),
    true,
    `${ctx}: valid setting kept`
  );
  assertEquals(
    mockStorage.getItem('disableRunningUiTestsOnDesktopLoadOnce'),
    true,
    `${ctx}: valid test flag kept`
  );
  assertEquals(res.findings.length, 5, `${ctx}: 5 findings`);
};

export function localStorageMigrationTestSuite() {
  const SUITE = localStorageMigrationTestSuite.name;
  return [
    runLogicTest(
      'LocalStorage Audit: ignores vendor keys, drops unknown app',
      testVendorKeysIgnoredAndUnknownAppKeysRemoved,
      SUITE,
      FILE_PATH
    ),
    runLogicTest(
      'LocalStorage Audit: removes invalid settings values',
      testInvalidSettingsRemovedAndValidKept,
      SUITE,
      FILE_PATH
    ),
  ];
}
