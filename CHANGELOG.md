<!-- CHANGELOG.md -->
# Changelog

All notable changes to this project will be documented in
this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased] - 2026-11-01

### Added
- **PWA (Progressive Web App) Installability Support**:
  - Configured `vite-plugin-pwa` with automatic manifest injection and Workbox precaching.
  - Added Web App Manifest (`manifest.webmanifest`) and fallback offline Service Worker (`public/sw.js`).
  - Added compliant icons: `icon.svg`, `pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png`, and `apple-touch-icon.png`.
  - Updated `index.html` with mobile viewport, theme color, and PWA capability meta tags.
  - Added PWA registration and utility service (`common/services/pwaService.ts`) with automated unit test suite (`testing/suites/services/pwaService.test.suite.ts`).
- **Delete Non-Empty Category Flow**:
  - Modal dialog (`DeleteCategoryModal`) that prompts the user
    when attempting to delete a category containing items.
  - Option to move contained items to another category
    (defaults to the "Uncategorized" category, with a
    dropdown to select any existing destination category).
  - Option to cascade-delete all items assigned to the
    category along with the category itself.
- **Service Layer & Helpers**:
  - Added `deleteCategoryAndMoveItems` and
    `deleteCategoryAndItems` helpers in
    `common/services/categoryService.ts`.
  - Extended `deleteCategory` to support
    `DeleteCategoryOptions`.
- **Localization**:
  - Added English localization keys for the delete category
    modal dialog, options, explanations, warnings, and button
    tooltips.
- **Automated Tests**:
  - Unit test suite coverage in
    `categoryService.test.suite.ts` testing empty category
    deletion, item moving, and cascade deletion.
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
  - Protected categories (e.g., Uncategorized) remain
    protected from deletion.
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
  - Fixed checkbox dimensions to explicit 38px square (`w-[38px] h-[38px]`)
    matching the item card height to prevent flexbox auto-sizing from
    collapsing the empty box into a vertical line.
