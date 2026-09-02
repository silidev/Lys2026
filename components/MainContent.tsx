const FILE_PATH = 'components/MainContent.tsx';
import React from 'react';
import type { ViewMode, ShoppingListItem, Category, ItemLocation } from '../types.ts';
import AddItemForm from './AddItemForm.tsx';
import ShoppingList from './ShoppingList.tsx';
import { AppConfig } from '../00configs/app.ts';

interface MainContentProps {
    mode: ViewMode;
    handleAddItem: () => void;
    currentCategories: Category[];
    allCurrentCategories: Category[];
    allShopCategories: Category[];
    allHomeCategories: Category[];
    itemMap: Map<string, ShoppingListItem>;
    handleUpdateItemAmount: (id: string, delta: number) => void;
    handleToggleItemCompleted: (id: string) => void;
    handleDeleteItem: (id: string) => void;
    handleCloneItem: (id: string) => void;
    handleReorderItem: (source: ItemLocation, destination: ItemLocation) => void;
    handleMoveItemToCategory: (id: string, newCategoryId: string, mode: ViewMode) => void;
    handleUpdateItem: (id: string, updates: Partial<Pick<ShoppingListItem, 'name' | 'amount' | 'nameShop' | 'alias' | 'nameExport'>>) => void;
    handleToggleDefaultCompleted: (id: string) => void;
    handleToggleItemUrgent: (id: string) => void;
    handleToggleItemUrgentOnce: (id: string) => void;
    onToggleHideUntilReset: (id: string) => void;
    onUpdateCategoryName: (categoryId: string, newName: string) => void;
    hideCompleted: boolean;
    showOnlyUrgent: boolean;
    showOnlyDefaultCompleted: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onClearSearch: () => void;
    addItemInputRef: React.RefObject<HTMLInputElement>;
    handleAddCategoryAndMoveItem: (newCategoryName: string, itemId: string, mode: ViewMode) => void;
    itemToAutoEditId: string | null;
    onAutoEditComplete: () => void;
    advancedMode: boolean;
    enableSplitItemNames: boolean;
    lastInteractedInHomeViewId: string | null;
    onSetLastInteractedInHomeViewId: (id: string | null) => void;
}

const MainContent: React.FC<MainContentProps> = ({
    mode, handleAddItem, currentCategories, allCurrentCategories, allShopCategories, allHomeCategories, itemMap, handleUpdateItemAmount, handleToggleItemCompleted, handleDeleteItem, handleCloneItem,
    handleReorderItem, handleMoveItemToCategory, handleUpdateItem, handleToggleDefaultCompleted,
    handleToggleItemUrgent, handleToggleItemUrgentOnce, onToggleHideUntilReset,
    onUpdateCategoryName, hideCompleted, showOnlyUrgent, showOnlyDefaultCompleted, searchTerm, setSearchTerm, onClearSearch, addItemInputRef,
    handleAddCategoryAndMoveItem, itemToAutoEditId, onAutoEditComplete, advancedMode, enableSplitItemNames, lastInteractedInHomeViewId, onSetLastInteractedInHomeViewId
}) => (
    <main className={`py-4 ${AppConfig.mainContentVerticalSpacingClass} ${AppConfig.screenEdgeHorizontalPaddingClass}`} data-testid="main-content">
        <AddItemForm ref={addItemInputRef} onAddItem={handleAddItem} value={searchTerm} onChange={setSearchTerm} onClear={onClearSearch} />
        <ShoppingList
            categories={currentCategories}
            allCurrentCategories={allCurrentCategories}
            allShopCategories={allShopCategories}
            allHomeCategories={allHomeCategories}
            itemMap={itemMap}
            onUpdateItemAmount={handleUpdateItemAmount}
            onToggleItemCompleted={handleToggleItemCompleted}
            onDeleteItem={handleDeleteItem}
            onCloneItem={handleCloneItem}
            onReorderItem={handleReorderItem}
            onMoveItemToCategory={handleMoveItemToCategory}
            onUpdateItem={handleUpdateItem}
            onToggleDefaultCompleted={handleToggleDefaultCompleted}
            onToggleItemUrgent={handleToggleItemUrgent}
            onToggleItemUrgentOnce={handleToggleItemUrgentOnce}
            onToggleHideUntilReset={onToggleHideUntilReset}
            onUpdateCategoryName={onUpdateCategoryName}
            mode={mode}
            hideCompleted={hideCompleted}
            showOnlyUrgent={showOnlyUrgent}
            showOnlyDefaultCompleted={showOnlyDefaultCompleted}
            searchTerm={searchTerm}
            onAddCategoryAndMoveItem={handleAddCategoryAndMoveItem}
            itemToAutoEditId={itemToAutoEditId}
            onAutoEditComplete={onAutoEditComplete}
            advancedMode={advancedMode}
            enableSplitItemNames={enableSplitItemNames}
            lastInteractedInHomeViewId={lastInteractedInHomeViewId}
            onSetLastInteractedInHomeViewId={onSetLastInteractedInHomeViewId}
        />
    </main>
);

export default MainContent;