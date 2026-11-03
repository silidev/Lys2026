# Bug Analysis & Unit Test Plan: Unexpected One-Time Items Appearing After Backup Restore

## Summary
Identify and reproduce the bug where one-time items (marked with `defaultCompleted: true` / "Seldom needed") that were not visible in the application when a backup was created appear in both Shop and Home views (specifically under the "Seldom needed" section in Home view) after restoring the backup into an empty or existing app.

---

## Confirmed Behavior & Architectural Invariants

> [!NOTE]
> **Filters and Backup (Explicitly Intended Behavior)**:
> As explicitly confirmed by the user, filter and view settings (`shopping-list-show-only-urgent`, `shopping-list-show-only-default-completed`, `shopping-list-hide-completed`) intentionally do **NOT** belong in backups. Items hidden purely by an active UI filter are expected and intended to reappear when restored into a fresh instance. This invariant has also been documented in `agents.md`.

> [!NOTE]
> **Naming Invariant**:
> The term "rush" has been retired. The feature is named "urgent" everywhere across code, tests, documentation, and types.

> [!IMPORTANT]
> **No Production Code Change Without Explicit Order**:
> Per project guidelines, we will first verify the exact behavior by writing isolated unit tests covering the backup/restore logic and visibility filters. Production code will only be modified upon explicit user review and instruction.

---

## 1. Bug Diagnostic Architecture & Hypotheses

The user noted:
- The unexpected items appear in both Shop and Home view (in Home view, in the "Seldom needed" section).
- The items have `amount: '1'` (they are not checked off with amount `0`).
- They were not visible when the backup was taken.

Given that filter settings intentionally do NOT belong in backups, what mechanisms could cause an item with `amount: '1'` to be hidden before backup, and visible after restore?

### Diagnostic Vectors
1. **`hideUntilReset` Persistence**:
   - In `ShoppingList.tsx` / `categoryService.ts`: Items with `hideUntilReset: true` are excluded from view via `getVisibleCategories`.
   - If an item was hidden via `hideUntilReset: true`, is `hideUntilReset` saved in the backup?
   - In `types.ts`, `ShoppingListItem` defines `hideUntilReset?: boolean;`.
   - If `hideUntilReset` is in the backup, does restore preserve it or does anything clear it?
2. **"Remove from this view" Asymmetry**:
   - An item can be assigned to `REMOVE_FROM_VIEW_CATEGORY_NAME` in `shopCategories` or `homeCategories`.
   - In `ItemEditModal`, items with `defaultCompleted: true` have the Home Category move button disabled (`{advancedMode && !item.defaultCompleted && ...}`), preventing users from easily removing seldom-needed items from the Home view.
   - If an item was removed from Shop view, it is hidden from Shop view, but still present in its Home category (rendered in "Seldom needed").
3. **One-Time Item Lifecycle (`defaultCompleted: true`)**:
   - When a seldom needed item is added or reset, its amount is `0` or `undefined` or `1`.
   - If `amount: '1'`, it is treated as needed (uncompleted).
   - In Home view, items with `defaultCompleted: true` and `amount !== '0'` appear in the `seldomNeededItems` section at the bottom.

```
┌─────────────────────────────────────────────────────────────┐
│                       Original App State                    │
├─────────────────────────────────────────────────────────────┤
│ • Item: defaultCompleted: true, amount: '1'                 │
│ • Hidden from screen via:                                   │
│   - hideUntilReset flag (temporary hide)                    │
│   - OR category assignment (e.g. Remove from this view)     │
│   - OR active search / filter state                         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                       [ Backup Now ]
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      lys-backup.json                        │
├─────────────────────────────────────────────────────────────┤
│ Serializes items, shopCategories, homeCategories            │
│ Filters are omitted by design                               │
└──────────────────────────────┬──────────────────────────────┘
                               │
                     [ Restore from File ]
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Restored App State                     │
├─────────────────────────────────────────────────────────────┤
│ • Restores raw items & categories                           │
│ • If hideUntilReset was present, does it persist?           │
│ • If removed from Shop view, Home view still displays it!   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Unit Test Suite Plan

We will add a dedicated unit test suite in `testing/suites/services/backupService.test.suite.ts`:

1. **Test 1: JSON Serialization & Property Preservation**:
   - Verify that all properties of `ShoppingListItem` (`amount`, `defaultCompleted`, `hideUntilReset`, `isUrgent`, `isUrgentOnce`) serialize and deserialize cleanly through `backupService.createBackupJson` and `backupService.parseBackupJson`.
2. **Test 2: `hideUntilReset` Lifecycle Across Backup/Restore**:
   - Verify whether an item hidden with `hideUntilReset: true` and `amount: '1'` maintains its hidden status after backup and restore.
3. **Test 3: Home & Shop View Visibility for Restored Seldom-Needed Items**:
   - Verify how `getVisibleCategories` and the `seldomNeededItems` logic in Home view treat restored items with `defaultCompleted: true` and `amount: '1'`.
4. **Test 4: View-Specific Removal Asymmetry**:
   - Verify behavior when an item is in `REMOVE_FROM_VIEW_CATEGORY_NAME` in `shopCategories` but in an active category in `homeCategories`.

---

## 3. Strict Coding Standards Compliance

- Every new file begins with:
  `const FILE_PATH = '<relative_path>';`
- Line wrapping at column ~60.
- Strict TypeScript types (no `any`, avoid `unknown`).
- All assertions use `assertEquals(actual, expected, message)`.
- Test failure logs report test name, file name, and path.
- Separation of concerns: Test code strictly separated from production code.
- No production code modified without explicit order.

---

## 4. Execution Log

- **Legacy Migration Removed**: Per explicit user order, the legacy data migration block in `App.tsx` (which mutated `item.amount` and deleted `completed`) has been completely removed. Backups now restore exact item data without modifying `amount` or properties.
- **Verification**: `lint_applet` passed (`tsc --noEmit`), `compile_applet` passed cleanly. Version timestamp updated.
