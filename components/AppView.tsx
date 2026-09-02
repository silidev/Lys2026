const FILE_PATH = 'components/AppView.tsx';
import React from 'react';
import type { ViewMode, ShoppingListData, ShoppingListItem, Category, ItemLocation } from '../types.ts';
import type { Theme } from '../hooks/useTheme.ts';
import Header from './Header.tsx';
import SettingsModal from './SettingsModal.tsx';
import TestResultOverlay from './TestResultOverlay.tsx';
import type { TestResult } from '../common/testing/types/testing.ts';
import MainContent from './MainContent.tsx';
import AppFooter from './AppFooter.tsx';
import ReloadOverlay from './ReloadOverlay.tsx';
import CancelUiTestsOverlay from './CancelUiTestsOverlay.tsx';
import ConfirmModal from './ConfirmModal.tsx';
import HelpModal from './HelpModal.tsx';

interface AppViewProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isSettingsOpen: boolean;
    handleOpenSettings: () => void;
    handleCloseSettings: () => void;
    isHelpModalOpen: boolean;
    handleOpenHelpModal: () => void;
    handleCloseHelpModal: () => void;
    mode: ViewMode;
    setMode: (mode: ViewMode) => void;
    backupIntervalHours: number;
    setBackupIntervalHours: (hours: number) => void;
    hideCompleted: boolean;
    handleToggleHideCompleted: () => void;
    showOnlyUrgent: boolean;
    handleToggleShowOnlyUrgent: () => void;
    showOnlyDefaultCompleted: boolean;
    handleToggleShowOnlyDefaultCompleted: () => void;
    newItemDefaultCompleted: boolean;
    setNewItemDefaultCompleted: (value: boolean) => void;
    advancedMode: boolean;
    setAdvancedMode: (value: boolean) => void;
    enableSplitItemNames: boolean;
    setEnableSplitItemNames: (value: boolean) => void;
    data: ShoppingListData;
    itemMap: Map<string, ShoppingListItem>;
    currentCategories: Category[];
    allCurrentCategories: Category[];
    allShopCategories: Category[];
    allHomeCategories: Category[];
    handleReset: () => void;
    rerunLogicTests: () => void;
    runUITests: () => void;
    handleUndo: () => void;
    handleRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    handleAddItem: () => void;
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
    handleToggleHideUntilReset: (id: string) => void;
    updateCurrentCategoryName: (categoryId: string, newName: string) => void;
    handleBackup: () => void;
    handleRestoreClick: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    addItemInputRef: React.RefObject<HTMLInputElement>;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleReorderCategory: (sourceIndex: number, destinationIndex: number, mode: ViewMode) => void;
    handleAddCategory: (name: string, mode: ViewMode) => void;
    handleDeleteCategory: (categoryId: string, mode: ViewMode) => void;
    handleUpdateCategoryName: (categoryId: string, newName: string, mode: ViewMode) => void;
    handleAddCategoryAndMoveItem: (newCategoryName: string, itemId: string, mode: ViewMode) => void;
    handleCopyMarkdownToClipboard: () => void;
    handleCopyUncheckedItemsToClipboard: () => void;
    onExportLocalStorage: () => void;
    testStatus: 'idle' | 'running' | 'completed';
    showTestOverlay: boolean;
    testResults: TestResult[];
    totalTests: number | undefined;
    handleCloseTestOverlay: () => void;
    lastRunSuiteType: 'logic' | 'ui';
    needsReload: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onClearSearch: () => void;
    lastBackupTimestamp: number | null;
    isUiTestCountdownActive: boolean;
    cancelAutomaticUiTests: () => void;
    startScheduledUiTestsNow: () => void;
    itemToAutoEditId: string | null;
    onAutoEditComplete: () => void;
    handleAddDemoData: () => void;
    handleConvertHiddenSections: () => void;
    confirmRestoreState: { isOpen: boolean; data: ShoppingListData | null };
    handleConfirmRestore: () => void;
    handleCloseConfirmRestore: () => void;
    confirmRestoreModalTitle: string;
    confirmRestoreModalConfirmText: string;
    confirmRestoreModalContent: React.ReactNode;
    lastInteractedInHomeViewId: string | null;
    onSetLastInteractedInHomeViewId: (id: string | null) => void;
}

const AppView: React.FC<AppViewProps> = ({
    theme, setTheme, isSettingsOpen, handleOpenSettings, handleCloseSettings, isHelpModalOpen, handleOpenHelpModal, handleCloseHelpModal, mode, setMode,
    backupIntervalHours, setBackupIntervalHours, hideCompleted, handleToggleHideCompleted,
    showOnlyUrgent, handleToggleShowOnlyUrgent, showOnlyDefaultCompleted, handleToggleShowOnlyDefaultCompleted,
    newItemDefaultCompleted, setNewItemDefaultCompleted,
    advancedMode, setAdvancedMode,
    enableSplitItemNames, setEnableSplitItemNames,
    data, itemMap, currentCategories, allCurrentCategories, allShopCategories, allHomeCategories, handleReset, rerunLogicTests,
    runUITests, handleUndo, handleRedo, canUndo, canRedo, handleAddItem, handleUpdateItemAmount, onExportLocalStorage,
    handleToggleItemCompleted,
    handleDeleteItem, handleCloneItem, handleReorderItem, handleMoveItemToCategory, handleUpdateItem, handleToggleDefaultCompleted,
    handleToggleItemUrgent, handleToggleItemUrgentOnce, handleToggleHideUntilReset,
    updateCurrentCategoryName, handleBackup, handleRestoreClick, fileInputRef, addItemInputRef, handleFileChange, handleReorderCategory, handleAddCategory,
    handleDeleteCategory, handleUpdateCategoryName, handleAddCategoryAndMoveItem, handleCopyMarkdownToClipboard, handleCopyUncheckedItemsToClipboard, testStatus, showTestOverlay, testResults,
    totalTests, handleCloseTestOverlay, lastRunSuiteType, needsReload,
    searchTerm, setSearchTerm, onClearSearch, lastBackupTimestamp,
    isUiTestCountdownActive, cancelAutomaticUiTests, startScheduledUiTestsNow,
    itemToAutoEditId, onAutoEditComplete, handleAddDemoData, handleConvertHiddenSections,
    confirmRestoreState, handleConfirmRestore, handleCloseConfirmRestore,
    confirmRestoreModalTitle, confirmRestoreModalConfirmText, confirmRestoreModalContent,
    lastInteractedInHomeViewId, onSetLastInteractedInHomeViewId
}) => (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100 py-2 sm:py-4 lg:py-6 flex justify-center items-start">
        <div className="w-full max-w-2xl">
            <div className="bg-white dark:bg-black rounded-lg shadow-xl">
                <Header
                    onReset={handleReset}
                    onOpenSettings={handleOpenSettings}
                    onOpenHelpModal={handleOpenHelpModal}
                    onRunLogicTests={rerunLogicTests}
                    onRunUITests={runUITests}
                    hideCompleted={hideCompleted}
                    onToggleHideCompleted={handleToggleHideCompleted}
                    showOnlyUrgent={showOnlyUrgent}
                    onToggleShowOnlyUrgent={handleToggleShowOnlyUrgent}
                    showOnlyDefaultCompleted={showOnlyDefaultCompleted}
                    onToggleShowOnlyDefaultCompleted={handleToggleShowOnlyDefaultCompleted}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onBackup={handleBackup}
                    onRestore={handleRestoreClick}
                    onCopyMarkdownToClipboard={handleCopyMarkdownToClipboard}
                    onCopyUncheckedItemsToClipboard={handleCopyUncheckedItemsToClipboard}
                    onExportLocalStorage={onExportLocalStorage}
                    mode={mode}
                    onModeChange={setMode}
                    advancedMode={advancedMode}
                    onAddDemoData={handleAddDemoData}
                    onConvertHiddenSections={handleConvertHiddenSections}
                />
                <MainContent
                    mode={mode}
                    handleAddItem={handleAddItem}
                    currentCategories={currentCategories}
                    allCurrentCategories={allCurrentCategories}
                    allShopCategories={allShopCategories}
                    allHomeCategories={allHomeCategories}
                    itemMap={itemMap}
                    handleUpdateItemAmount={handleUpdateItemAmount}
                    handleToggleItemCompleted={handleToggleItemCompleted}
                    handleDeleteItem={handleDeleteItem}
                    handleCloneItem={handleCloneItem}
                    handleReorderItem={handleReorderItem}
                    handleMoveItemToCategory={handleMoveItemToCategory}
                    handleUpdateItem={handleUpdateItem}
                    handleToggleDefaultCompleted={handleToggleDefaultCompleted}
                    handleToggleItemUrgent={handleToggleItemUrgent}
                    handleToggleItemUrgentOnce={handleToggleItemUrgentOnce}
                    onToggleHideUntilReset={handleToggleHideUntilReset}
                    onUpdateCategoryName={updateCurrentCategoryName}
                    hideCompleted={hideCompleted}
                    showOnlyUrgent={showOnlyUrgent}
                    showOnlyDefaultCompleted={showOnlyDefaultCompleted}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onClearSearch={onClearSearch}
                    addItemInputRef={addItemInputRef}
                    handleAddCategoryAndMoveItem={handleAddCategoryAndMoveItem}
                    itemToAutoEditId={itemToAutoEditId}
                    onAutoEditComplete={onAutoEditComplete}
                    advancedMode={advancedMode}
                    enableSplitItemNames={enableSplitItemNames}
                    lastInteractedInHomeViewId={lastInteractedInHomeViewId}
                    onSetLastInteractedInHomeViewId={onSetLastInteractedInHomeViewId}
                />
            </div>
            <AppFooter
                testStatus={testStatus}
                testResults={testResults}
                totalTests={totalTests}
                lastBackupTimestamp={lastBackupTimestamp}
            />
        </div>
        <SettingsModal
            isOpen={isSettingsOpen}
            onClose={handleCloseSettings}
            theme={theme}
            setTheme={setTheme}
            backupData={data}
            onReorderCategory={handleReorderCategory}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onUpdateCategoryName={handleUpdateCategoryName}
            backupIntervalHours={backupIntervalHours}
            onSetBackupInterval={setBackupIntervalHours}
            lastBackupTimestamp={lastBackupTimestamp}
            newItemDefaultCompleted={newItemDefaultCompleted}
            onSetNewItemDefaultCompleted={setNewItemDefaultCompleted}
            advancedMode={advancedMode}
            onSetAdvancedMode={setAdvancedMode}
            enableSplitItemNames={enableSplitItemNames}
            onSetEnableSplitItemNames={setEnableSplitItemNames}
        />
        {isHelpModalOpen && (
            <HelpModal
                isOpen={isHelpModalOpen}
                onClose={handleCloseHelpModal}
            />
        )}
        {testStatus === 'completed' && showTestOverlay && (
            <TestResultOverlay
                results={testResults}
                onClose={handleCloseTestOverlay}
                onRunUITests={runUITests}
                lastRunSuiteType={lastRunSuiteType}
            />
        )}
        {needsReload && <ReloadOverlay />}
        {isUiTestCountdownActive && (
            <CancelUiTestsOverlay 
                onCancel={cancelAutomaticUiTests}
                onStartNow={startScheduledUiTestsNow}
            />
        )}
        {confirmRestoreState.isOpen && (
            <ConfirmModal
                isOpen={confirmRestoreState.isOpen}
                onClose={handleCloseConfirmRestore}
                onConfirm={handleConfirmRestore}
                title={confirmRestoreModalTitle}
                confirmText={confirmRestoreModalConfirmText}
                confirmButtonClass="bg-green-600 hover:bg-green-700 focus:ring-green-500"
            >
                {confirmRestoreModalContent}
            </ConfirmModal>
        )}
        <input
            id="restore-input"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
        />
    </div>
);

export default AppView;