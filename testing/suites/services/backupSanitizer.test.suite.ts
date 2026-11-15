const FILE_PATH =
  'testing/suites/services/backupSanitizer.test.suite.ts';
import {
  sanitizeShoppingListDataForBackup,
} from '../../../common/services/shoppingListMigrationCategories.ts';
import { runLogicTest } from '../../helpers.ts';
import {
  assertEquals,
} from '../../../common/testing/services/tests/helpers.ts';
import type { ShoppingListData } from '../../../types.ts';

const testSanitizeBackupStripsExtraFields = () => {
  const fn = testSanitizeBackupStripsExtraFields.name;
  const ctx = `${fn} in ${FILE_PATH}`;
  const dirty = {
    items: [
      {
        id: 'a1',
        name: 'Eggs',
        amount: '6',
        isUrgent: true,
        isUrgentOnce: false,
        sneakyField: 'drop-me',
        isRush: false,
      },
    ],
    shopCategories: [
      { id: 's1', name: 'Fridge', itemIds: ['a1'], hideable: true },
    ],
    homeCategories: [{ id: 'h1', name: 'Fridge', itemIds: ['a1'] }],
    extraTopLevel: 'should-not-be-backed-up',
  } as unknown as ShoppingListData;

  const clean = sanitizeShoppingListDataForBackup(dirty);
  assertEquals(
    Object.keys(clean).sort(),
    ['homeCategories', 'items', 'shopCategories'],
    `${ctx}: clean root keys`
  );
  assertEquals(
    'sneakyField' in clean.items[0],
    false,
    `${ctx}: stripped sneaky field`
  );
  assertEquals(
    'isRush' in clean.items[0],
    false,
    `${ctx}: stripped legacy isRush`
  );
  assertEquals(
    clean.items[0].isUrgent,
    true,
    `${ctx}: kept valid urgent flag`
  );
  assertEquals(
    'hideable' in clean.shopCategories[0],
    false,
    `${ctx}: stripped category field`
  );
};

export function backupSanitizerTestSuite() {
  const SUITE = backupSanitizerTestSuite.name;
  return [
    runLogicTest(
      'Backup Sanitizer: strips non-schema fields from export',
      testSanitizeBackupStripsExtraFields,
      SUITE,
      FILE_PATH
    ),
  ];
}
