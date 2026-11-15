const FILE_PATH =
  'testing/suites/services/shoppingListMigration.test.suite.ts';
import {
  migrateAndCleanShoppingListData,
} from '../../../common/services/shoppingListMigrationData.ts';
import { runLogicTest } from '../../helpers.ts';
import {
  assertEquals,
} from '../../../common/testing/services/tests/helpers.ts';

const testLegacyIgnoredFieldsRemovedWithoutCopying = () => {
  const fn = testLegacyIgnoredFieldsRemovedWithoutCopying.name;
  const ctx = `${fn} in ${FILE_PATH}`;
  const raw = {
    items: [
      {
        id: 'i1',
        name: 'Milk',
        amount: '1',
        isRush: true,
        isRushOnce: true,
        completed: true,
      },
      {
        id: 'd-37',
        name: 'Apples',
        amount: '0',
        isRush: false,
        isUrgent: true,
      },
    ],
    shopCategories: [
      {
        id: 's1',
        name: 'Fridge',
        itemIds: ['i1', 'd-37'],
        hideable: true,
      },
    ],
    homeCategories: [
      { id: 'h1', name: 'Fridge', itemIds: ['i1', 'd-37'] },
    ],
  };

  const res = migrateAndCleanShoppingListData(raw);
  assertEquals(res.changed, true, `${ctx}: changed`);
  const items = res.data!.items;
  assertEquals('isRush' in items[0], false, `${ctx}: drop isRush`);
  assertEquals(
    'isRushOnce' in items[0],
    false,
    `${ctx}: drop isRushOnce`
  );
  assertEquals(
    'completed' in items[0],
    false,
    `${ctx}: drop completed`
  );
  assertEquals(
    items[0].isUrgent,
    undefined,
    `${ctx}: 1B keeps visible urgent unchanged`
  );
  assertEquals(items[0].amount, '1', `${ctx}: amount kept`);
  assertEquals(items[1].isUrgent, true, `${ctx}: keeps d-37`);
  assertEquals(
    'hideable' in res.data!.shopCategories[0],
    false,
    `${ctx}: drop hideable`
  );
  assertEquals(
    res.findings.every((f) => f.severity === 'info'),
    true,
    `${ctx}: legacy cleanup reported as info only`
  );
};

const testStructuralAndUnknownFieldsCleanup = () => {
  const fn = testStructuralAndUnknownFieldsCleanup.name;
  const ctx = `${fn} in ${FILE_PATH}`;
  const raw = {
    extraRoot: 123,
    items: [
      {
        id: 'i1',
        name: 'Bread',
        amount: 5,
        isUrgent: 'yes',
        unknownFlag: true,
      },
      { id: 'orphan', name: 'Never Shown', amount: '1' },
      { id: '', name: 'Bad ID' },
    ],
    shopCategories: [
      {
        id: 's1',
        name: 'Bakery',
        itemIds: ['i1', 'i1', 'missing', 99],
        catJunk: 'x',
      },
      { id: 's1', name: 'Dup Cat', itemIds: ['i1'] },
    ],
    homeCategories: [
      { id: 'h1', name: 'Pantry', itemIds: ['i1'] },
    ],
  };

  const res = migrateAndCleanShoppingListData(raw);
  assertEquals(res.changed, true, `${ctx}: changed`);
  const data = res.data!;
  assertEquals(data.items.length, 1, `${ctx}: only valid shown`);
  assertEquals(data.items[0].id, 'i1', `${ctx}: kept i1`);
  assertEquals(
    data.items[0].amount,
    undefined,
    `${ctx}: bad amount type removed`
  );
  assertEquals(
    data.items[0].isUrgent,
    undefined,
    `${ctx}: bad isUrgent type removed`
  );
  assertEquals(
    'unknownFlag' in data.items[0],
    false,
    `${ctx}: unknown item field removed`
  );
  assertEquals(
    data.shopCategories.length,
    1,
    `${ctx}: duplicate cat removed`
  );
  assertEquals(
    data.shopCategories[0].itemIds,
    ['i1'],
    `${ctx}: itemIds deduped & cleaned`
  );
  assertEquals(
    res.findings.some((f) => f.severity === 'warning'),
    true,
    `${ctx}: warnings reported`
  );
};

export function shoppingListMigrationTestSuite() {
  const SUITE = shoppingListMigrationTestSuite.name;
  return [
    runLogicTest(
      'List Migration: ignored legacy fields dropped cleanly',
      testLegacyIgnoredFieldsRemovedWithoutCopying,
      SUITE,
      FILE_PATH
    ),
    runLogicTest(
      'List Migration: cleans unknown & structural problems',
      testStructuralAndUnknownFieldsCleanup,
      SUITE,
      FILE_PATH
    ),
  ];
}
