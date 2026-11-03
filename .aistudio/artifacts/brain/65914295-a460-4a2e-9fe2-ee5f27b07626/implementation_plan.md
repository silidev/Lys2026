# Bug Analysis & Unit Test Plan: Unexpected One-Time Items Appearing After Backup Restore

## Summary
Identify and reproduce the bug where one-time items (marked with `defaultCompleted: true` / "Seldom needed") that were not visible in the application when a backup was created unexpectedly appear in both Shop and Home views (specifically under the "Seldom needed" section in Home view) after restoring the backup into an empty or existing app.

---

## User Review & Critical Decisions

> [!NOTE]
> **Resolved Dev Server Crash**: Fixed `TypeError: Cannot read properties of undefined (reading 'send')` by disabling `devOptions` in `VitePWA` in `vite.config.ts`, ensuring compatibility with the WebSocket-free development environment.

> [!IMPORTANT]
> **No Production Code Change Without Explicit Order**: As requested in project guidelines, we will first verify the exact behavior by writing isolated unit tests covering the backup/restore logic and visibility filters. Production code will only be modified upon your explicit review and instruction.

- **Confirmed Observation 1**: The unexpected items appear in both Shop and Home view (in Home view, in the "Seldom needed" section).
- **Confirmed Observation 2**: The items have `amount: '1'` (they are not checked off with amount 0).
- **Primary Root Cause Vector**: 
  1. The regular backup mechanism (`handleBackup`) serializes only `ShoppingListData` (`items`, `shopCategories`, `homeCategories`). It does **not** back up `localStorage` filter/view settings (`shopping-list-show-only-rush`, `shopping-list-show-only-default-completed`, `shopping-list-hide-completed`). If items were hidden on-screen due to an active filter or view-specific category when the backup was taken, restoring the backup into a default state (where filters are reset) causes them to immediately appear.
  2. In `ItemEditModal`, items with `defaultCompleted: true` have the Home Category move button disabled (`{advancedMode && !item.defaultCompleted && ...}`), preventing users from assigning or moving seldom-needed items to "Remove from this view" in the Home view.
  3. Category synchronization asymmetry: An item moved to "Remove from this view" in Shop view is hidden from Shop view, but remains assigned to its Home category (appearing in "Seldom needed").

---

## 1. Bug Mechanism & Diagnostic Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Original App State                    │
├─────────────────────────────────────────────────────────────┤
│ • Item created with defaultCompleted: true, amount: '1'     │
│ • Hidden from screen via:                                   │
│   - View filter (e.g., Rush/Urgent mode filter)             │
│   - OR moved to 'Remove from this view' in Shop view only   │
│   - OR hideUntilReset flag                                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                       [ Backup Now ]
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      lys-backup.json                        │
├─────────────────────────────────────────────────────────────┤
│ Contains raw items:                                         │
│   { id, name, amount: '1', defaultCompleted: true }         │
│ Does NOT contain: filter settings (showOnlyRush, etc.)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                     [ Restore from File ]
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Restored App State                     │
├─────────────────────────────────────────────────────────────┤
│ • Fresh localStorage: showOnlyRush=false, showOnlySeldom=false│
│ • Home View: Item rendered in 'Seldom needed' section!      │
│ • Shop View: Item rendered in its Category!                 │
└──────────────────────────────┘
```

---

## 2. Proposed Unit Test Suite

We will add a dedicated unit test suite in `testing/suites/services/backupService.test.suite.ts` adhering to all project requirements:

1. **Test 1: Backup & Restore Data Integrity for One-Time Items**:
   - Verify what properties of `ShoppingListItem` (including `amount`, `defaultCompleted`, `hideUntilReset`, `isRush`) are preserved across JSON serialization and deserialization.
2. **Test 2: View Visibility Discrepancy on Restore**:
   - Verify that an item with `defaultCompleted: true` and `amount: '1'` is filtered out when special filters or view categories are applied, but becomes visible in `getVisibleCategories` and `seldomNeededItems` once restored into standard view mode.
3. **Test 3: Category Asymmetry Between Views**:
   - Test item present in `shopCategories` under `REMOVE_FROM_VIEW_CATEGORY_NAME` but present in `homeCategories` under `Uncategorized`, verifying that it remains visible in Home view under `seldomNeededItems`.

---

## 3. Strict Coding Standards Compliance

- Every new file begins with:
  `const FILE_PATH = '<relative_path>';`
- Line wrapping at column ~60.
- Strict TypeScript types (no `any`, no `unknown`).
- All assertions use `assertEquals(actual, expected, message)`.
- Test failure logs report test name, file name, and path.
- Separation of concerns: Test code strictly in separate files from production code.
- No production code modified without explicit order.
