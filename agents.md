<!-- agents.md -->
# Developer & Agent Guide for Lys

This document captures essential knowledge, patterns,
conventions, and invariants to help AI agents and developers
work efficiently and safely on the Lys codebase.

---

## 1. Project Philosophy & Core Concepts

- **What Lys is**: A zero-backend, 100% client-side web
  application designed primarily for mobile phones to manage
  household inventory and grocery shopping.
- **Dual-View Model**:
  - `home` mode: Items ordered by how they are checked at
    home (pantry, fridge, cellar, etc.).
  - `shop` mode: Items ordered by walking route through the
    store / supermarket aisles.
  - Every active item belongs to both a `shopCategory` and a
    `homeCategory`.
- **Storage & Offline**:
  - All state persists exclusively in browser `localStorage`.
  - No external databases, no remote backend APIs.
  - Complete data export/import via JSON backups.

---

## 2. Inviolable Project Rules (from 00INSTRUCTIONS.md)

1. **First Line File Path**:
   - In the first line of EVERY code file, assign its full
     relative path to a variable:
     `const FILE_PATH = 'path/to/file.ts';`
   - In Markdown files, add `<!-- filename.md -->` at line 1.
2. **Line Wrapping**:
   - Where possible, wrap lines around column 60.
3. **Language**:
   - English only for code, UI text, and comments.
4. **No Creativity on File Changes**:
   - Never interpret change requests creatively.
   - If an order is ambiguous or contradicts app design,
     do NOT change files; report the conflict to the user.
5. **No Native Alert/Confirm**:
   - Never use `window.alert` or `window.confirm`.
   - Use `/components/ConfirmModal.tsx` or specialized modals
     like `/components/DeleteCategoryModal.tsx`.
6. **Tooltips on Interactive Elements**:
   - All interactive UI elements must provide descriptive
     help text using the `title` attribute for longpress and
     mouseover.
7. **TypeScript Discipline**:
   - Make types as specific as possible.
   - Never use `any`. Avoid `unknown`.
8. **Small File Size**:
   - Keep files small; split files larger than 5 KB when
     appropriate.
9. **Version Date Tracking**:
   - Update `/00alwaysUpdate/version.ts` timestamp whenever
     making meaningful application changes.
10. **Changelog Maintenance**:
   - The changelog is kept at the end of `/README.md`
     (do NOT create or maintain a separate `CHANGELOG.md`).
   - Document notable changes under the `# Changelog` section
     at the end of `README.md`.

---

## 3. Data Structure & Backward Compatibility

### Item & Category Types (`types.ts`)
```ts
interface ShoppingListItem {
  id: string;
  name: string;
  nameShop?: string;
  alias?: string;
  nameExport?: string;
  amount?: string;
  defaultCompleted?: boolean;
  isUrgent?: boolean;
  isUrgentOnce?: boolean;
  hideUntilReset?: boolean;
}

interface Category {
  id: string;
  name: string;
  itemIds: string[];
}

interface ShoppingListData {
  items: ShoppingListItem[];
  shopCategories: Category[];
  homeCategories: Category[];
}
```

### Backup Compatibility Rule
When updating data structures, you MUST maintain import
compatibility for older backup formats:
- `OldShoppingListDataWithOrder` (`shoppingOrder`, `homeOrder`)
- `OldShoppingListDataWithSections` (`shopSections`, `homeSections`)
See `/common/services/backupService.ts` for migration helpers.

### Backup Scope & View Filters (Intended Behavior)
- Backups intentionally serialize ONLY `ShoppingListData`
  (`items`, `shopCategories`, `homeCategories`).
- Filter and view settings (e.g., `shopping-list-show-only-urgent`,
  `shopping-list-show-only-default-completed`,
  `shopping-list-hide-completed`) are intentionally NOT
  saved into backups.
- Consequently, if an item is hidden in the UI due to an
  active filter or view setting when a backup is created,
  restoring that backup into a fresh app instance (where
  filters are reset to defaults) will show that item again.
  This behavior is explicitly intended and by design.

---

## 4. Category Lifecycle & Deletion Architecture

- **Uncategorized Category**:
  - Acts as the fallback bucket.
  - Cannot be renamed or deleted.
- **Deleting Categories**:
  - **Empty category**: Deleted immediately without
    confirmation modal.
  - **Non-empty category**: Opens `DeleteCategoryModal.tsx`.
    The user is given two options:
    1. *Move Items*: Moves all items to another category
       (defaults to "Uncategorized", selectable dropdown).
    2. *Delete Items*: Cascade-deletes all contained items.
  - Corresponding service methods in `categoryService.ts`:
    - `deleteCategory(categories, id, options)`
    - `deleteCategoryAndMoveItems(categories, id, targetId)`
    - `deleteCategoryAndItems(categories, id, allItems)`

---

## 5. Testing Architecture & In-Browser Runner

Lys does NOT use Jest or Vitest from the command line. Tests
run directly inside the browser environment.

- **Test Categories**:
  - `logicTestSuites` in `/testing/testSuites.ts`: Pure unit
    and service logic tests (run automatically on desktop).
  - `uiTestSuites` in `/testing/testSuites.ts`: React Testing
    Library component tests.
- **Test Runner Config** (`/00configs/common/testing.ts`):
  - `disableRunningUiTestsOnDesktopLoad`: When `true`, UI
    tests do not run on initial load; only logic tests run.
  - `disablesTestsOnMobile`: Keeps mobile experience clean
    and fast.
- **Assertion Rules**:
  - NEVER use `assert(a == b)` for equality.
  - ALWAYS use `assertEquals(actual, expected, message)`.
  - All test failures must report the test function name,
    file name, and full path.
  - NEVER test static UI elements by displayed text; select
    them by ID or dedicated test selectors.

---

## 6. Directory Map

- `/00alwaysUpdate/`
  - `version.ts`: Current app version date & time.
- `/00configs/`
  - `app.ts`: Global visual & layout constants (Tailwind),
    including `enableShopItemCompletionCheckbox` to toggle the
    Shop View completion checkbox vs. legacy click-to-complete.
  - `common/testing.ts`: In-browser test runner settings.
- `/common/services/`
  - `categoryService.ts`: Category operations & deletion.
  - `itemService.ts`: Item CRUD, reordering, amounts.
  - `storageService.ts`: `localStorage` reads/writes.
  - `backupService.ts`: Export/import and legacy migrations.
  - `ttsService.ts`: Speech synthesis for item names.
- `/components/`
  - Core UI views, list items, headers, and modal dialogs.
- `/hooks/`
  - `useShoppingListData.ts`: Main state management hook.
  - `useLocalStorage.ts`: Synchronized persistent state.
- `/localization/locales/en.ts`
  - All UI copy, modal texts, and tooltips.
- `/testing/`
  - Test suites, mocks, and browser test runner logic.

---

## 7. Fast Verification Workflow

Before concluding any task or turn, always run:
1. `npm run lint` (`tsc --noEmit` via `lint_applet` tool) to
   ensure strict TypeScript types pass.
2. `compile_applet` to ensure Vite bundle builds cleanly.
3. Keep `00alwaysUpdate/version.ts` timestamp synchronized.
4. Document notable changes under `# Changelog` at the end
   of `/README.md`.
