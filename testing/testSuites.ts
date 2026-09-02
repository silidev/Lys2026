// testing/testSuites.ts
import { runAllIntentionalFailureTests } from '../common/testing/services/tests/intentionalFailure.test.ts';
import { runAllTestLogServiceTests } from '../common/testing/services/tests/testLogService.test.ts';
import type { TestSuite } from '../common/testing/types/testing.ts';

// New Test Suites
import { useLocalStorageTestSuite } from './suites/hooks/useLocalStorage.test.suite.ts';
import { useThemeTestSuite } from './suites/hooks/useTheme.test.suite.ts';
import { addItemFormTestSuite } from './suites/components/AddItemForm.test.suite.ts';
import { shoppingListItemTestSuite } from './suites/components/ShoppingListItem.test.suite.ts';
import { modeSwitcherTestSuite } from './suites/components/ModeSwitcher.test.suite.ts';
import { moveItemModalTestSuite } from './suites/components/MoveItemModal.test.suite.ts';
import { itemEditModalTestSuite } from './suites/components/ItemEditModal.test.suite.ts';
import { appHeaderTestSuite } from './suites/app/App.header.test.suite.ts';
import { appItemsAddTestSuite } from './suites/app/App.items.add.test.suite.ts';
import { appModesTestSuite } from './suites/app/App.modes.test.suite.ts';
import { categoryManagerAddTestSuite } from './suites/components/CategoryManager.add.test.suite.ts';
import { categoryManagerBaseTestSuite } from './suites/components/CategoryManager.base.test.suite.ts';
import { categoryManagerDeleteTestSuite } from './suites/components/CategoryManager.delete.test.suite.ts';
import { categoryManagerEditKeysTestSuite } from './suites/components/CategoryManager.edit.keys.test.suite.ts';
import { categoryManagerEditNameTestSuite } from './suites/components/CategoryManager.edit.name.test.suite.ts';
import { backupServiceTestSuite } from './suites/services/backupService.test.suite.ts';
import { appReorderBetweenCategoriesDndTestSuite } from './suites/app/App.reorder.betweenCategories.dnd.test.suite.ts';
import { appReorderBetweenCategoriesModalTestSuite } from './suites/app/App.reorder.betweenCategories.modal.test.suite.ts';
import { shoppingListBaseTestSuite } from './suites/components/ShoppingList.base.test.suite.ts';
import { shoppingListActionsTestSuite } from './suites/components/ShoppingList.actions.test.suite.ts';
import { storageServiceTestSuite } from './suites/services/storageService.test.suite.ts';
import { useShoppingListDataTestSuite } from './suites/hooks/useShoppingListData.test.suite.ts';
import { useAppTestRunnerTestSuite } from './suites/hooks/useAppTestRunner.test.suite.ts';
import { categoryServiceTestSuite } from './suites/services/categoryService.test.suite.ts';
import { searchServiceTestSuite } from './suites/services/searchService.test.suite.ts';
import { itemServiceTestSuite } from './suites/services/itemService.test.suite.ts';
import { useUndoableStateTestSuite } from './suites/hooks/useUndoableState.test.suite.ts';
import { useAutobackupTestSuite } from './suites/common/hooks/useAutobackup.test.suite.ts';
import { listServiceTestSuite } from './suites/services/listService.test.suite.ts';
import { headerMenuTestSuite } from './suites/components/HeaderMenu.test.suite.ts';
import { usePreviousTestSuite } from './suites/common/hooks/usePrevious.test.suite.ts';
import { appBackupTestSuite } from './suites/app/App.backup.test.suite.ts';
import { appLocalStorageTestSuite } from './suites/app/App.localStorage.test.suite.ts';
import { appClipboardTestSuite } from './suites/app/App.clipboard.test.suite.ts';

// It's important that these functions have names, as the test runner uses fn.name.
const intentionalFailureTestSuiteFile = 'common/testing/services/tests/intentionalFailure.test.ts';
function intentionalFailureTestSuite() { return runAllIntentionalFailureTests(intentionalFailureTestSuite.name, intentionalFailureTestSuiteFile) }

const testLogServiceTestSuiteFile = 'common/testing/services/tests/testLogService.test.ts';
function testLogServiceTestSuite() { return runAllTestLogServiceTests(testLogServiceTestSuite.name, testLogServiceTestSuiteFile) }

// --- Logic/Unit Test Suites ---
export const logicTestSuites: TestSuite[] = [
  // Original suites
  intentionalFailureTestSuite,
  testLogServiceTestSuite,

  // Converted suites
  useLocalStorageTestSuite,
  useThemeTestSuite,
  backupServiceTestSuite,
  storageServiceTestSuite,
  useShoppingListDataTestSuite,
  useAppTestRunnerTestSuite,
  categoryServiceTestSuite,
  searchServiceTestSuite,
  itemServiceTestSuite,
  useUndoableStateTestSuite,
  useAutobackupTestSuite,
  listServiceTestSuite,
  usePreviousTestSuite,
];

// --- UI/Component/App Test Suites ---
export const uiTestSuites: TestSuite[] = [
  headerMenuTestSuite,
  addItemFormTestSuite,
  shoppingListItemTestSuite,
  modeSwitcherTestSuite,
  moveItemModalTestSuite,
  itemEditModalTestSuite,
  appHeaderTestSuite,
  appItemsAddTestSuite,
  appModesTestSuite,
  categoryManagerAddTestSuite,
  categoryManagerBaseTestSuite,
  categoryManagerDeleteTestSuite,
  categoryManagerEditKeysTestSuite,
  categoryManagerEditNameTestSuite,
  appReorderBetweenCategoriesDndTestSuite,
  appReorderBetweenCategoriesModalTestSuite,
  shoppingListBaseTestSuite,
  shoppingListActionsTestSuite,
  appBackupTestSuite,
  appLocalStorageTestSuite,
  appClipboardTestSuite,
  ];