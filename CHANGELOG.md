<!-- CHANGELOG.md -->
# Changelog

All notable changes to this project will be documented in
this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased] - 2026-11-01

### Added
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
