const FILE_PATH =
  'testing/suites/services/localStorageListAudit.test.suite.ts';
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
import type { ShoppingListData } from '../../../types.ts';

const testLegacyHistoryRecoveryAndCorruptProtection = (
  mockStorage: MockStorageService
) => {
  const fn = testLegacyHistoryRecoveryAndCorruptProtection.name;
  const ctx = `${fn} in ${FILE_PATH}`;
  mockStorage.clear();
  const sample: ShoppingListData = {
    items: [{ id: '1', name: 'Tea', amount: '1' }],
    shopCategories: [{ id: 's1', name: 'Shop', itemIds: ['1'] }],
    homeCategories: [{ id: 'h1', name: 'Home', itemIds: ['1'] }],
  };
  mockStorage.setItem('shopping-list-data-history-state', {
    history: [sample],
    currentIndex: 0,
  });

  const recovered = migrateAndAuditLocalStorage();
  assertEquals(
    mockStorage.getItem<ShoppingListData>('shopping-list-data'),
    sample,
    `${ctx}: recovered from history`
  );
  assertEquals(
    mockStorage.getRawItem('shopping-list-data-history-state'),
    null,
    `${ctx}: removed history key`
  );
  assertEquals(
    recovered.findings.some((f) => f.severity === 'info'),
    true,
    `${ctx}: info reported`
  );

  mockStorage.clear();
  mockStorage.setRawItem('shopping-list-data', '{broken json');
  const corrupt = migrateAndAuditLocalStorage();
  assertEquals(
    corrupt.hasCorruptListData,
    true,
    `${ctx}: flagged corrupt list`
  );
  assertEquals(
    mockStorage.getRawItem('shopping-list-data'),
    '{broken json',
    `${ctx}: raw corrupt JSON untouched`
  );
};

const testRerunAfterCleanupProducesZeroFindings = (
  mockStorage: MockStorageService
) => {
  const fn = testRerunAfterCleanupProducesZeroFindings.name;
  const ctx = `${fn} in ${FILE_PATH}`;
  mockStorage.clear();
  mockStorage.setRawItem('vendor-key', 'keep');
  mockStorage.setItem('shopping-list-data', {
    items: [{ id: '1', name: 'Oats', isRush: true }],
    shopCategories: [{ id: 's1', name: 'Shop', itemIds: ['1'] }],
    homeCategories: [{ id: 'h1', name: 'Home', itemIds: ['1'] }],
  });
  mockStorage.setItem('shopping-list-last-interacted-in-home-view', 'gone');

  const first = migrateAndAuditLocalStorage();
  assertEquals(first.findings.length > 0, true, `${ctx}: cleaned`);
  assertEquals(
    mockStorage.getRawItem('shopping-list-last-interacted-in-home-view'),
    null,
    `${ctx}: dangling last-interacted ID cleared`
  );

  const second = migrateAndAuditLocalStorage();
  assertEquals(
    second.findings,
    [],
    `${ctx}: subsequent startup has zero findings`
  );
};

export function localStorageListAuditTestSuite() {
  const SUITE = localStorageListAuditTestSuite.name;
  return [
    runLogicTest(
      'LocalStorage Audit: history recovery & corrupt protection',
      testLegacyHistoryRecoveryAndCorruptProtection,
      SUITE,
      FILE_PATH
    ),
    runLogicTest(
      'LocalStorage Audit: subsequent startup clean after cleanup',
      testRerunAfterCleanupProducesZeroFindings,
      SUITE,
      FILE_PATH
    ),
  ];
}
