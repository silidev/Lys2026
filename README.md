<!-- README.md -->
Keeping essential food and other items well-stocked at home and
shopping for them always stressed me out because it was so
chaotic. Giving this process a clear structure helped a lot.
I've been using a self-developed app for it over the past year
or two, and I've been super happy with it ever since. All
important items are shown first in the order you want to check
them at home, and then in the order you walk through the
supermarket.

It has no ads and is forever completely free and open source.

Demo video: https://youtu.be/MnWHacRQ6O4?is=25mWa1iOfSNVoS5S

Try it out (designed for phones!):
https://silidev.github.io/Lys2026/dist/index.html

Source code: https://github.com/silidev/Lys2026

---

# Changelog

All notable changes to this project will be documented in
this section of `README.md`.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased] - 2026-11-13

### Added
- **Backup Restore Validation & Error Modal**:
  - Added strict backup validation (`common/services/backupValidation.ts`)
    and `ErrorModal` (`components/ErrorModal.tsx`) to display prominent
    error dialogs when an imported backup is malformed or invalid.
  - Added a prominent warning banner in the Restore Confirmation dialog
    listing any unknown/ignored properties found in the imported file.
  - Added unit and UI test suites (`backupValidation.test.suite.ts`,
    `useUndoableStateSafety.test.suite.ts`,
    `App.backup.restoreEdges.test.suite.ts`,
    `App.backup.restoreErrors.test.suite.ts`).

### Fixed
- **Undo History Storage Quota & Data Preservation**:
  - Moved undo/redo history in `hooks/useUndoableState.ts` to in-memory
    state only, preventing 50-snapshot `shopping-list-data-history-state`
    quota exhaustion and stale rollbacks while preserving one-time
    recovery from legacy `shopping-list-data-history-state`.
  - Protected unparseable `localStorage` data from silent overwrite and
    surfaced `QuotaExceededError` / storage failures via `ErrorModal`.
  - Fixed stale-closure overwrites on rapid consecutive updates in
    `hooks/useLocalStorage.ts` and `hooks/useUndoableState.ts`.
- **Duplicate React Instance / Invalid Hook Call in Dev**:
  - Updated `public/sw.js` (`lysi-cache-v2`) to purge stale
    caches, bypass Vite dev modules (`/@*`,
    `/node_modules/*`, `.ts`/`.tsx`, `?v=`), and use
    network-first for navigation/HTML requests.
  - Restricted Service Worker registration in `index.tsx`
    to production builds and added
    `unregisterPwaServiceWorkers` cleanup in dev mode.
  - Added `resolve.dedupe` and `optimizeDeps.include` for
    React and test dependencies in `vite.config.ts`.

## [Unreleased] - 2026-11-08

### Changed
- **PWA Application Icons**:
  - Replaced all PWA icon assets (`pwa-512x512.png`,
    `pwa-192x192.png`, `pwa-maskable-512x512.png`,
    `apple-touch-icon.png`, `favicon.png`, `favicon.ico`,
    `icon.svg`, and `icon-maskable.svg`) with the new grocery
    basket brand artwork.
  - Ensured maskable icon has safe-zone padding to prevent
    clipping on Android home screens.
- **Changelog Location**:
  - Moved `CHANGELOG.md` content to the end of `README.md`
    for visibility on the GitHub repository homepage and removed
    the standalone `CHANGELOG.md` file.

## [0.1.0] - 2026-11-01

### Added
- **PWA (Progressive Web App) Installability Support**:
  - Configured `vite-plugin-pwa` with automatic manifest injection
    and Workbox precaching.
  - Added Web App Manifest (`manifest.webmanifest`) and fallback
    offline Service Worker (`public/sw.js`).
  - Added compliant icons: `icon.svg`, `pwa-192x192.png`,
    `pwa-512x512.png`, `pwa-maskable-512x512.png`, and
    `apple-touch-icon.png`.
  - Updated `index.html` with mobile viewport, theme color, and
    PWA capability meta tags.
  - Added PWA registration and utility service
    (`common/services/pwaService.ts`) with automated unit test
    suite (`testing/suites/services/pwaService.test.suite.ts`).
- **Delete Non-Empty Category Flow**:
  - Modal dialog (`DeleteCategoryModal`) that prompts the user
    when attempting to delete a category containing items.
  - Option to move contained items to another category
    (defaults to the "Uncategorized" category, with a dropdown
    to select any existing destination category).
  - Option to cascade-delete all items assigned to the category
    along with the category itself.
- **Service Layer & Helpers**:
  - Added `deleteCategoryAndMoveItems` and `deleteCategoryAndItems`
    helpers in `common/services/categoryService.ts`.
  - Extended `deleteCategory` to support `DeleteCategoryOptions`.
- **Localization**:
  - Added English localization keys for the delete category modal
    dialog, options, explanations, warnings, and button tooltips.
- **Automated Tests**:
  - Unit test suite coverage in `categoryService.test.suite.ts`
    testing empty category deletion, item moving, and cascade
    deletion.
  - Component test coverage in
    `CategoryManager.delete.test.suite.ts` testing modal
    invocation, choice selection, and callbacks.

### Changed
- **Category Manager UI**:
  - Enabled the delete button for non-empty categories in
    `CategoryManagerItem.tsx` (previously disabled when items
    were present).
  - Updated tooltips to accurately reflect the action on
    categories containing items.
  - Protected categories (e.g., Uncategorized) remain protected
    from deletion.
- **Shop View Item Interaction & Completion Checkbox**:
  - Added `enableShopItemCompletionCheckbox` configuration switch
    in `00configs/app.ts` (defaults to `true`).
  - When enabled, a dedicated square checkbox is rendered directly
    to the left of the item card. Clicking this square completes
    the item (removes it from Shop View).
  - Clicking the item body/name in Shop View now opens the Edit
    View modal instead of completing the item, preventing
    accidental completion while handling the device.
  - Added unit and component tests in
    `ShoppingListItem.test.suite.ts` testing both the checkbox
    flow and the legacy click-to-complete fallback.
  - Fixed checkbox dimensions to explicit 38px square
    (`w-[38px] h-[38px]`) matching the item card height to prevent
    flexbox auto-sizing from collapsing the empty box into a
    vertical line.