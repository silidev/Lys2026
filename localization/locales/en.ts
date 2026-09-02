
export const en = {
    header: {
        showChecked: 'Show Checked',
        urgent: 'Urgent',
        tooltips: {
            showChecked: 'Show or hide items that have been checked off the list.',
            urgent: "Filter the list to show only items marked as 'Urgent'. Urgent items are meant for quick shopping trips.",
            undo: 'Undo the last change you made to the list, like adding, editing, or checking an item.',
            redo: 'Redo an action that you just undid.',
            openMenu: 'Open the main menu for actions like settings, backup, and more.',
            focusAddItem: 'Scroll to top and focus input to add a new item',
        },
        aria: {
            undo: 'Undo',
            redo: 'Redo',
            openMenu: 'Open menu',
            focusAddItem: 'Focus add item input',
        }
    },
    headerMenu: {
        backupNow: 'Backup Now',
        copyMarkdown: 'Copy shop view to clipboard - with Sections',
        copyUnchecked: 'Copy shop view to clipboard - Items only',
        development: 'Development',
        help: 'Help',
        more: 'More...',
        resetList: 'Reset List',
        restoreFromFile: 'Restore from File',
        settings: 'Settings',
        showCheckedItems: 'Show checked items also',
        showCheckedOnResetOnly: 'Show "Seldom needed" items only',
        devMenu: {
            title: 'Development',
            addDemoData: 'Add demo data',
            dangerous: 'DANGEROUS',
            reload: 'Reload',
            runLogicTests: 'Run Logic Tests',
            runUITests: 'Run UI Tests',
            disableUITestsOnce: 'Disable running UI Tests on Desktop Load ONCE',
            exportLocalStorage: 'Export localstorage to JSON',
            temp: 'Temp',
        },
        tempMenu: {
            title: 'Temp',
            convertHidden: "Convert 'Hidden' to 'Delete...' sections",
        },
        dangerousMenu: {
            title: 'DANGEROUS',
            confirmDelete: 'Really delete EVERYTHING?',
            yesDelete: 'Yes, delete EVERYTHING.',
        },
        moreMenu: {
            title: 'More Actions',
        },
        tooltips: {
            backupNow: 'Save a JSON file of all your items and sections to your computer. You can use this file to restore your list later.',
            copyMarkdown: 'Copies the current Shop view list to your clipboard, formatted in Markdown with section headers and checkboxes. Useful for sharing or pasting into notes.',
            copyUnchecked: 'Copies only the names of unchecked items in the Shop view to the clipboard as a plain text list. Useful for a quick, simple shopping list.',
            development: 'Access tools for testing and debugging the application. Intended for developers.',
            help: "Get help on how to use the app's features.",
            more: 'Access more actions like backup, restore, and help.',
            resetList: 'Set quantity of items, which have the setting "Often needed" from zero to one.',
            restoreFromFile: 'Upload a previously saved JSON backup file to overwrite your current list. This action cannot be undone.',
            settings: 'Open the settings modal to manage sections, appearance, and other application preferences.',
            showCheckedItems: 'Show or hide items that have been checked off the list.',
            showCheckedOnResetOnly: "Filter the list to show only items that have the 'Seldom needed' option enabled in their edit screen.",
            devMenu: {
                return: 'Return to main menu',
                addDemoData: 'Adds a set of demo items, plus 20 empty sections and a few test items.',
                dangerous: 'Open menu with dangerous, destructive options',
                reload: 'Reload the application',
                runLogicTests: 'Run all logic tests',
                runUITests: 'Run all UI tests and show results. The app may need a reload afterwards.',
                disableUITestsOnce: 'Temporarily disable UI tests for the next page load',
                exportLocalStorage: 'Export the entire raw content of localStorage to a JSON file.',
                temp: 'Open menu with temporary, experimental options',
            },
            tempMenu: {
                return: 'Return to development menu',
                convertHidden: "Convert sections named 'Hidden' to 'Delete from this view'",
            },
            dangerousMenu: {
                return: 'Return to development menu',
                confirmDelete: 'This is a confirmation step. The next button is the one that deletes data.',
                yesDelete: 'Delete the localstorage completely to reset the app to its default state. THIS CANNOT BE UNDONE.',
            },
            moreMenu: {
                return: 'Return to main menu',
            },
        },
    },
    addItemForm: {
        placeholder: 'Add or search for items...',
        aria: {
            newItem: 'Add new item or search list',
            clear: 'Clear input',
            add: 'Add item',
        },
        tooltips: {
            newItem: 'Add a new item or search the list',
            clear: 'Clear the text from the input field.',
            add: 'Add the item written in the input field to your shopping list.',
        }
    },
    shoppingListItem: {
        aria: {
            markCompleted: 'Mark {0} as completed',
            quantity: 'Current quantity for {0}',
            decreaseQuantity: 'Decrease quantity for {0}',
            increaseQuantity: 'Increase quantity for {0}',
            editItem: 'Edit {0}',
            moveUp: 'Move {0} up',
            moveDown: 'Move {0} down',
        },
        tooltips: {
            checkbox: 'Mark this item as completed or not completed. This is the main checkbox for shopping.',
            quantity: 'The quantity you need you want to buy.',
            decreaseQuantity: 'Decrease the quantity of this item. If the quantity reaches zero, the item will be marked as completed.',
            currentQuantity: 'The current quantity of this item. Can be a number or a description like \'1kg\'.',
            increaseQuantity: 'Increase the quantity of this item. If the quantity was zero, this will un-check the item.',
            editItem: 'Edit this item.',
            moveUp: 'Move this item one position up within its current category.',
            moveDown: 'Move this item one position down within its current category.',
        }
    },
    shoppingList: {
        search: {
            noResults: 'No items match your search.',
        },
        empty: {
            filtered: 'No items marked as {0}.',
            allCompleted: 'All items completed!',
            allFilteredCompleted: 'All {0} items are completed!',
            markInEdit: 'You can mark items in their edit screen.',
            showCheckedPrompt: 'Check "Show checked" to see them, or add new items.',
        },
        filterNames: {
            urgent: "Urgent",
            checkedOnReset: "Seldom needed",
        }
    },
    emptyShoppingList: {
        title: 'Your shopping list is empty.',
        prompt: 'Add some items above to get started!',
    },
    shoppingListCategory: {
        empty: 'No items in this category.',
        allCompleted: 'All items in this category are completed.',
        aria: {
            edit: 'Edit category name {0}',
        },
        tooltips: {
            editName: 'Enter a new name for this category and press Enter to save, or Escape to cancel.',
            editIcon: 'Click to edit the name of this category. You can also double-click the category name.',
        }
    },
    modeSwitcher: {
        home: 'Home',
        shop: 'Shop',
        tooltips: {
            home: 'Switch to the Home view. In this view, you can manage item quantities and see a list organized for home inventory.',
            shop: 'Switch to the Shop view. This view is organized for shopping at a store, with simple checkboxes.',
        },
        aria: {
            label: 'View Mode',
        }
    },
    itemEditModal: {
        title: 'Edit Item',
        save: 'Save',
        itemNameLabel: 'Item Name',
        itemNameHomeLabel: 'Item Name in Home View',
        itemNameShopLabel: 'Item Name in Shop View',
        aliasLabel: 'Alias (for search)',
        nameExportLabel: 'Name for Export',
        amountLabel: 'Number needed',
        selectHomeCategory: 'Select Home Category',
        selectShopCategory: 'Select Shop Category',
        seldomNeeded: 'Seldom needed',
        oftenNeeded: 'Often needed',
        urgentAlways: 'Urgent, always',
        urgentThisTime: 'Urgent, this time',
        hideUntilReset: 'Hide until reset',
        delete: 'Delete',
        clone: 'Clone Item',
        confirmDelete: {
            title: 'Confirm Deletion',
            message: 'Are you sure you want to delete "{0}"?',
        },
        tooltips: {
            save: "Save any changes made to the item's name and amount, then close this screen.",
            itemName: 'Enter the new name for the item',
            itemNameShop: 'Enter a specific name for this item for the Shop view. If left empty, the Home view name will be used.',
            fullscreen: 'Edit the item name in a distraction-free fullscreen view.',
            exitFullscreen: 'Exit fullscreen edit',
            alias: 'Enter alternative names or keywords for this item to help find it via search.',
            nameExport: 'Enter a specific name for this item for exports. If left empty, the Shop view name or Home view name will be used.',
            amount: 'Enter the amount for the item',
            clearAmount: 'Remove the amount from this item.',
            selectHomeCategory: 'Open a dialog to move this item to a different Home category.',
            selectShopCategory: 'Open a dialog to move this item to a different Shop category.',
            seldomNeeded: "When needed, these item must be marked needed by the user. 'Reset List' WILL not mark this as needed. In the home view these are listed at the bottom.",
            oftenNeeded: "Always check inventory before going shopping. 'Reset List' WILL not mark this as needed.",
            urgentAlways: "Mark this as a 'Urgent' item. You can then filter the list to see only urgent items, which is useful for quick shopping trips.",
            urgentThisTime: "Mark this as urgent for this shopping trip only. The item will appear in 'Urgent' mode, but this flag will be cleared once you check the item off your list.",
            hideUntilReset: "Set this checkbox if you do NOT want to buy this item on the current shopping trip. When this is checked, the item is hidden. When the list is reset, this checkbox will be set to unset and the item will be shown again.",
            delete: 'Permanently delete this item from your list. This cannot be undone, except with the main Undo button.',
            clone: 'Create a copy of this item with the same properties.',
        },
        aria: {
            fullscreen: 'Enter fullscreen edit',
            exitFullscreen: 'Exit fullscreen edit',
            clearAmount: 'Clear amount',
        }
    },
    moveItemModal: {
        title_prefix: 'Move "',
        title_suffix: '"',
        destination: 'Select a destination {0} category:',
        current: '(current)',
        addNewCategory: 'Add new category...',
        cancel: 'Cancel',
        prompt: 'Enter the name for the new category:',
        tooltips: {
            move: "Move the selected item into the '{0}' category.",
            addNew: 'Create a new category and move this item to it',
            cancel: 'Close this dialog without moving the item.',
        },
        aria: {
            moveTo: 'Move to {0}',
        }
    },
    settingsModal: {
        title: 'Settings',
        close: 'Close settings',
        tooltips: {
            close: 'Close the settings panel and return to the main list.',
        }
    },
    appearanceSettings: {
        title: 'Appearance',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
        tooltips: {
            light: "Set the application's appearance to a light color scheme.",
            dark: "Set the application's appearance to a dark color scheme.",
            system: "Let the application automatically use your operating system's light or dark mode setting.",
        }
    },
    categoryManagementSettings: {
        homeTitle: 'Home View Categories',
        shopTitle: 'Shop View Categories',
    },
    categoryManager: {
        hideable: 'Hideable',
        addCategory: 'Add Category',
        tooltips: {
            hideable: 'Hide category when the Hide checkbox in the header above the item list is checked',
            addCategory: 'Add a new, empty category to the bottom of this list.',
        }
    },
    categoryManagerItem: {
        aria: {
            drag: 'Drag to reorder {0}',
            edit: 'Edit category name {0}',
            delete: 'Delete category {0}',
            moveUp: 'Move {0} up',
            moveDown: 'Move {0} down',
        },
        tooltips: {
            drag: 'Press and hold to drag this category to a new position in the list.',
            editInput: 'Enter the new name for this category. Press Enter to save or Escape to cancel.',
            cannotRename: 'Cannot rename the "{0}" category',
            editIcon: "Edit the name of this category. The 'Uncategorized' category cannot be renamed.",
            deleteDisabledItems: 'Cannot delete category with items.',
            deleteDisabledProtected: 'Cannot delete the "{0}" category.',
            delete: "Delete this category. A category can only be deleted if it is empty. 'Uncategorized' cannot be deleted.",
            moveUp: 'Move this category one position up.',
            moveDown: 'Move this category one position down.',
        }
    },
    addCategoryForm: {
        placeholder: 'New category name',
        save: 'Save',
        cancel: 'Cancel',
        tooltips: {
            name: 'Enter the name for the new category',
            save: 'Save the new category',
            cancel: 'Cancel adding a new category',
        }
    },
    autoBackupSettings: {
        title: 'Automatic Backup',
        description: 'Periodically download a backup of your data. Set to 0 to disable.',
        label: 'Backup every',
        hours: 'hours',
        lastBackup: 'Last backup: {0}',
        tooltips: {
            interval: 'Set the interval in hours for automatic backup. Set to 0 to disable.',
            lastBackup: 'Full date: {0}',
        }
    },
    advancedFeaturesSettings: {
        title: 'Advanced Features',
        description: 'Do not read any further if you are happy with the app as it is. This is only for experienced users.',
        advancedMode: 'Advanced Mode',
        enableSplitItemNames: 'Enable different item names in Home and Shop view',
        checkOnReset: 'Check "Seldom needed" for new items',
        tooltips: {
            advancedMode: 'Enable advanced features like developer tools, Rush mode, and more.',
            enableSplitItemNames: 'Instead of one item name field, two will be shown, for Home and Shop view',
            checkOnReset: "When enabled, any new item you add will have its 'Seldom needed' option turned on by default. Useful for items you buy regularly.",
        }
    },
    dataManagementSettings: {
        title: 'Data Management',
        backupNow: 'Backup Now',
        restoreFromFile: 'Restore from File...',
        tooltips: {
            backup: 'Download a backup file of your current list',
            restore: 'Restore your list from a backup file',
        }
    },
    testResultOverlay: {
        failedTitle: 'Tests Failed',
        passedTitle: 'All tests passed ({0})',
        failedMessage: '{0} of {1} tests failed.',
        close: 'Close test results',
        reload: 'Reload',
        runUITests: 'Run UI Tests',
        copyLog: 'Copy Full Log',
        logCopied: 'Log Copied!',
        tooltips: {
            close: 'Close test results overlay',
            reload: 'Force a complete reload of the application. This is recommended after UI tests have run.',
            runUITests: 'Run all UI tests',
            copyLog: 'Copy the full test log to the clipboard',
        }
    },
    reloadOverlay: {
        title: 'Reload the app',
        button: 'Disable running UI Tests on Desktop Load ONCE',
        tooltip: 'Reload the app, but skip running UI tests just this once',
    },
    cancelUITestsOverlay: {
        title: 'Automatic UI Tests Pending',
        message: 'Tests will start in {0} seconds.',
        startNow: 'Start them now',
        cancel: 'Cancel UI Tests',
        tooltips: {
            startNow: 'Start the automatic UI test run now',
            cancel: 'Cancel the automatic UI test run',
        }
    },
    confirmModal: {
        confirm: 'Confirm',
        cancel: 'Cancel',
        tooltips: {
            confirm: 'Confirm this action',
            cancel: 'Cancel this action',
        },
        restore: {
            title: 'Confirm Restore',
            confirm: 'Restore',
            message: 'Are you sure you want to restore this backup? This will overwrite your current list.',
        }
    },
    helpModal: {
        title: 'How to get help',
        close: 'Close help',
        gotIt: 'Got it!',
        para1: 'The specialty of this app is to let you check how much of important items you have still have at home before going shopping.',
        para2: 'Some features are hidden to make it easier for new users. Later you probably want to enable Advanced Mode in the Settings.',
        para3: 'Long press (on mobile) or hover your mouse over any button or interactive element to see a detailed tooltip explaining what it does.',
        para4: 'You can also',
        para4_strong: 'double-click',
        para4_cont: 'on item names to edit them directly without opening a menu.',
        tooltips: {
            close: 'Close this help dialog.',
            gotIt: 'Close this help dialog',
        }
    },
    appFooter: {
        localSave: 'Your data is saved locally in your browser.',
        lastBackup: 'Last backup: {0}',
        testsRunning: 'Tests running: {0} / {1} finished...',
        testsFailed: '{1} tests finished, {0} failed.',
        testsPassed: 'All {0} tests passed.',
        version: 'v{0} ({1} days ago)',
        reload: 'Reload',
        copyright: 'Copyright 2025 by Helge Tobias Kosuch',
        tooltips: {
            lastBackup: 'Full date: {0}',
            reload: 'Force a complete reload of the application. Useful if something seems wrong.',
        }
    },
    alerts: {
        unknownError: 'Unknown error',
        backup: {
            emptyList: 'Cannot back up an empty list.',
        },
        restore: {
            fileNotReadable: 'File content is not readable as text.',
            invalidFormat: 'Invalid backup file format. The file must be an array of shopping list items or a valid data object.',
            genericError: 'Failed to restore backup. Please make sure you are using a valid backup file. Error:',
            fileReadError: 'Error reading file.',
            success: 'Shopping list restored successfully!',
        },
        clipboard: {
            nothingToCopy: 'There is nothing to copy from the shop view.',
            markdownSuccess: 'Copied shop view to clipboard as markdown!',
            genericError: 'Failed to copy to clipboard.',
            noUncheckedItems: 'There are no unchecked items in the shop view to copy.',
            uncheckedSuccess: 'Copied unchecked items to clipboard!',
        },
        forbiddenCategoryNames: 'Category names "Uncategorized" and "{0}" are forbidden.',
    },
    time: {
        today: 'today',
        yesterday: 'yesterday',
        daysAgo: '{0} days ago',
    }
};