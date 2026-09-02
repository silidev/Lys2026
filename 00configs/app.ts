const FILE_PATH = '00configs/app.ts';

/** The internal name for the special category that hides items from a view. */
export const REMOVE_FROM_VIEW_CATEGORY_NAME = 'Remove from this view';

/**
 * Application-wide configuration settings.
 */
export const AppConfig = {
  /**
   * The minimum height of the header. This should be a valid
   * Tailwind CSS class for min-height. e.g., 'min-h-[64px]'
   */
  headerHeightClass: 'min-h-[30px]',

  /**
   * If true, disables the browser's default right-click context menu.
   * Long-pressing an element will show a custom tooltip instead.
   */
  disableContextMenu: false,

  /**
   * If true, enables advanced features by default. This sets the
   * initial state for the "Advanced Mode" checkbox in settings.
   */
  DevMode: true,

  /**
   * The horizontal padding applied to the main content areas.
   * This should be a valid Tailwind CSS class for horizontal padding.
   * e.g., 'px-4'
   */
  screenEdgeHorizontalPaddingClass: 'px-1',

  /**
   * The vertical distance between individual items within a category's list.
   * This should be a valid Tailwind CSS class for vertical spacing.
   * e.g., 'space-y-2'
   */
  listItemVerticalSpacingClass: 'space-y-1',

  /**
   * The vertical distance between entire categories in the shopping list.
   * This should be a valid Tailwind CSS class for vertical spacing.
   * e.g., 'space-y-4'
   */
  interCategoryVerticalSpacingClass: 'space-y-0',

  /**
   * The vertical padding applied above the category name in the item list.
   * This should be a valid Tailwind CSS class for top padding.
   * e.g., 'pt-2'
   */
  categoryHeaderVerticalPaddingClass: 'pt-0',

  /**
   * The vertical distance between elements in the main content area,
   * such as between the add item form and the shopping list.
   * This should be a valid Tailwind CSS class for vertical spacing.
   * e.g., 'space-y-4'
   */
  mainContentVerticalSpacingClass: 'space-y-0',

  /**
   * The minimum width for the container displaying the item quantity (e.g., "2 x").
   * This should be a valid Tailwind CSS class for min-width.
   * e.g., 'min-w-[40px]'
   */
  amountContainerMinWidthClass: 'min-w-[0px]',

  /**
   * The styling for the category headers in the item list.
   * This should be a valid Tailwind CSS class string.
   * e.g., 'text-center text-orange-600'
   */
  categoryHeaderStyleClass: 'text-center text-orange-600 dark:text-orange-500',

  /**
   * The vertical padding unit for shopping list items. Used to construct py- classes.
   */
  listItemInternalPaddingVerticalUnit: '1',
  
  /**
   * The horizontal padding unit for shopping list items. Used to construct px- classes.
   */
  listItemInternalPaddingHorizontalUnit: '2',
  
  /**
   * The horizontal padding unit for the right side of shopping list items.
   * Used to construct pr- classes. A larger value creates more space on the right.
   */
  listItemRightPaddingUnit: '2',
  
  /**
   * If true, the 'Move to category' icon is shown on all items.
   * If false, it's only shown for items in the 'Uncategorized' category.
   */
  showMoveToCategoryIconForAllItems: true,
};