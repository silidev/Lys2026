const FILE_PATH = 'App.tsx';
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ViewMode, ShoppingListData } from './types';
import { useTheme } from './hooks/useTheme';
import { useShoppingListData } from './hooks/useShoppingListData.ts';
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import { useAutobackup } from './common/hooks/useAutobackup.ts';
import { useAppTestRunner } from './hooks/useAppTestRunner.ts';
import AppView from './components/AppView.tsx';
import { filterVisibleCategories } from './common/services/searchService.ts';
import downloaderService from './common/services/downloader.ts';
import storageService from './common/services/storageService.ts';
import { isShoppingListData, isShoppingListItem, migrateToCategories, migrateFromSections } from './common/services/backupService.ts';
import { getVisibleCategories } from './common/services/categoryService.ts';
import { getClipboardDisplayName } from './common/services/itemService.ts';
import type { OldShoppingListDataWithOrder, ShoppingListItem, OldShoppingListDataWithSections } from './types.ts';
import { AppConfig } from './00configs/app.ts';
import { LongPressProvider } from './common/longPressTooltip/LongPressProvider.tsx';
import { LocalizationProvider, useLocalization } from './localization/i18n.ts';


const AppContent: React.FC = () => {
  const { t } = useLocalization();
  const [theme, setTheme] = useTheme();
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [mode, setMode] = useState<ViewMode>('home');
  const [backupIntervalHours, setBackupIntervalHours] = useLocalStorage<number>('shopping-list-autobackup-interval-h', 24);
  const [hideCompleted, setHideCompleted] = useLocalStorage<boolean>('shopping-list-hide-completed', true);
  const [showOnlyUrgent, setShowOnlyUrgent] = useLocalStorage<boolean>('shopping-list-show-only-rush', false);
  const [showOnlyDefaultCompleted, setShowOnlyDefaultCompleted] = useLocalStorage<boolean>('shopping-list-show-only-default-completed', false);
  const [newItemDefaultCompleted, setNewItemDefaultCompleted] = useLocalStorage<boolean>('shopping-list-new-item-default-completed', true);
  const [advancedMode, setAdvancedMode] = useLocalStorage<boolean>('shopping-list-advanced-mode', AppConfig.DevMode);
  const [enableSplitItemNames, setEnableSplitItemNames] = useLocalStorage<boolean>('shopping-list-enable-split-item-names', true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastBackupTimestamp, setLastBackupTimestamp] = useState<number | null>(null);
  const [itemToAutoEditId, setItemToAutoEditId] = useState<string | null>(null);
  const [confirmRestoreState, setConfirmRestoreState] = useState<{ isOpen: boolean; data: ShoppingListData | null }>({ isOpen: false, data: null });
  const [lastInteractedInHomeViewId, setLastInteractedInHomeViewId] = useLocalStorage<string | null>('shopping-list-last-interacted-in-home-view', null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addItemInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refreshTimestamp = () => {
      const ts = storageService.getItem<number>('lys-last-manual-backup-timestamp');
      setLastBackupTimestamp(ts);
    };
    refreshTimestamp();
    window.addEventListener('lys:backup-complete', refreshTimestamp);
    return () => {
        window.removeEventListener('lys:backup-complete', refreshTimestamp);
    };
  }, []);

  useEffect(() => {
    if (AppConfig.disableContextMenu) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
      };
      document.addEventListener('contextmenu', handleContextMenu);
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, []);

  const {
      data,
      itemMap,
      currentCategories,
      handleAddItem,
      handleUpdateItemAmount,
      handleToggleItemCompleted,
      handleDeleteItem,
      handleCloneItem,
      handleReset,
      handleRestore,
      handleReorderItem,
      handleMoveItemToCategory,
      handleReorderCategory,
      handleUpdateItem,
      handleUpdateCategoryName,
      handleAddCategory,
      handleDeleteCategory,
      handleUndo,
      handleRedo,
      canUndo,
      canRedo,
      handleAddCategoryAndMoveItem,
      handleToggleItemUrgent,
      handleToggleItemUrgentOnce,
      handleToggleDefaultCompleted,
      handleToggleHideUntilReset,
      handleAddDemoData,
      handleConvertHiddenSections,
  } = useShoppingListData(mode, setLastInteractedInHomeViewId);
  
  const handleResetWithUrgent = useCallback(() => {
    setItemToAutoEditId(null);
    handleReset(showOnlyUrgent && advancedMode);
  }, [handleReset, showOnlyUrgent, advancedMode]);
  
  const getBackupData = useCallback(() => data, [data]);

  const handleFocusAddItem = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addItemInputRef.current?.focus();
  }, []);
  
  const addItemAndClearSearch = useCallback(() => {
    const trimmed = searchTerm.trim();
    if (trimmed) {
      setShowOnlyDefaultCompleted(false);
      const newId = handleAddItem(trimmed, newItemDefaultCompleted);
      setItemToAutoEditId(newId);
      setSearchTerm('');
    }
  }, [searchTerm, handleAddItem, newItemDefaultCompleted, setShowOnlyDefaultCompleted]);

  const handleModeChange = useCallback((newMode: ViewMode) => {
    setMode(newMode);
    handleFocusAddItem();
  }, [handleFocusAddItem]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleToggleHideCompleted = useCallback(() => {
    setHideCompleted(prev => !prev);
    if (searchTerm) {
        handleClearSearch();
    }
    handleFocusAddItem();
  }, [handleClearSearch, setHideCompleted, searchTerm, handleFocusAddItem]);

  const handleToggleShowOnlyUrgent = useCallback(() => {
    setShowOnlyUrgent(prev => !prev);
    handleFocusAddItem();
  }, [setShowOnlyUrgent, handleFocusAddItem]);

  const handleToggleShowOnlyDefaultCompleted = useCallback(() => setShowOnlyDefaultCompleted(prev => !prev), [setShowOnlyDefaultCompleted]);

  const handleBackup = useCallback(() => {
    if (data.items.length === 0) {
      alert(t('alerts.backup.emptyList'));
      return;
    }
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() +1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const hh = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const timestamp = `${yy}${mm}${dd}${hh}${min}`;
    const filename = `lys-${timestamp}.json`;

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    downloaderService.downloadBlob(dataBlob, filename);
    
    storageService.setItem('lys-last-manual-backup-timestamp', Date.now());
    window.dispatchEvent(new CustomEvent('lys:backup-complete'));
  }, [data, t]);

  const handleRestoreClick = useCallback(() => {
      fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error(t('alerts.restore.fileNotReadable'));
        }
        const parsedData: unknown = JSON.parse(text);
        
        let dataToRestore: ShoppingListData | null = null;

        if (isShoppingListData(parsedData)) {
            if ('shopCategories' in parsedData) {
                dataToRestore = parsedData as ShoppingListData;
            } else if ('shopSections' in parsedData) {
                dataToRestore = migrateFromSections(parsedData as OldShoppingListDataWithSections);
            } else if ('shoppingOrder' in parsedData) {
                dataToRestore = migrateToCategories(parsedData as OldShoppingListDataWithOrder);
            }
        } else if (Array.isArray(parsedData) && parsedData.every(isShoppingListItem)) {
            const itemIds = parsedData.map(item => item.id);
            dataToRestore = migrateToCategories({ items: parsedData, shoppingOrder: itemIds, homeOrder: itemIds });
        }

        if (dataToRestore) {
            // Migrate items from old `completed` boolean to new `amount` system
            dataToRestore.items = dataToRestore.items.map((item: any) => {
              if ('completed' in item) {
                  if (item.completed === true) {
                      item.amount = '0';
                  } else if (item.amount === '0') {
                      delete item.amount;
                  }
                  delete item.completed;
              }
              return item;
            });

            setConfirmRestoreState({ isOpen: true, data: dataToRestore });
        } else {
            throw new Error(t('alerts.restore.invalidFormat'));
        }

      } catch (error: unknown) {
        console.error('Failed to restore backup:', error);
        alert(`${t('alerts.restore.genericError')} ${error instanceof Error ? error.message : t('alerts.unknownError')}`);
      }
    };
    reader.onerror = () => {
        alert(t('alerts.restore.fileReadError'));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    reader.readAsText(file);
  }, [t]);

  const handleConfirmRestore = useCallback(() => {
    if (confirmRestoreState.data) {
        handleRestore(confirmRestoreState.data);
        alert(t('alerts.restore.success'));
    }
    setConfirmRestoreState({ isOpen: false, data: null });
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, [confirmRestoreState.data, handleRestore, t]);
  
  const handleCloseConfirmRestore = useCallback(() => {
    setConfirmRestoreState({ isOpen: false, data: null });
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, []);


  useAutobackup(
      backupIntervalHours,
      getBackupData,
      {
          filenamePrefix: 'lys-autobak',
          timestampKey: 'lys-last-manual-backup-timestamp'
      }
  );

  const {
    testStatus,
    testResults,
    totalTests,
    showTestOverlay,
    lastRunSuiteType,
    rerunLogicTests,
    runUITests,
    handleCloseTestOverlay,
    needsReload,
    isUiTestCountdownActive,
    cancelAutomaticUiTests,
    startScheduledUiTestsNow,
  } = useAppTestRunner();

  const handleOpenSettings = useCallback(() => setSettingsOpen(true), []);
  const handleCloseSettings = useCallback(() => setSettingsOpen(false), []);
  const handleOpenHelpModal = useCallback(() => setHelpModalOpen(true), []);
  const handleCloseHelpModal = useCallback(() => setHelpModalOpen(false), []);

  const updateCurrentCategoryName = useCallback((categoryId: string, newName: string) => {
    handleUpdateCategoryName(categoryId, newName, mode);
  }, [handleUpdateCategoryName, mode]);

  const isSearching = searchTerm.trim() !== '';
  const isSpecialFilterActive = advancedMode && (showOnlyUrgent || showOnlyDefaultCompleted);

  const categoriesForList = useMemo(() => {
    if (isSearching) {
        return filterVisibleCategories(currentCategories, itemMap, searchTerm);
    }
    
    let filteredCategories = currentCategories;

    if (advancedMode && showOnlyUrgent) {
        filteredCategories = filteredCategories.map(category => ({
            ...category,
            itemIds: category.itemIds.filter(itemId => {
                const item = itemMap.get(itemId);
                return item?.isRush || item?.isRushOnce;
            })
        }));
    }
    
    if (advancedMode && showOnlyDefaultCompleted) {
        filteredCategories = filteredCategories.map(category => ({
            ...category,
            itemIds: category.itemIds.filter(itemId => itemMap.get(itemId)?.defaultCompleted)
        }));
    }
    
    if (isSpecialFilterActive) {
        return filteredCategories.filter(category => category.itemIds.length > 0);
    }
    
    return currentCategories;
  }, [isSearching, searchTerm, currentCategories, itemMap, showOnlyUrgent, showOnlyDefaultCompleted, advancedMode, isSpecialFilterActive]);

  const handleCopyMarkdownToClipboard = useCallback(() => {
    const categoriesToCopy = data.shopCategories;

    // Use the global hideCompleted state, ignoring search and urgent filters for this action.
    const visibleCategories = getVisibleCategories(categoriesToCopy, itemMap, hideCompleted);

    if (visibleCategories.length === 0) {
      alert(t('alerts.clipboard.nothingToCopy'));
      return;
    }
    
    const markdownString = visibleCategories.map(category => {
      let itemsToRender = category.itemIds
        .map(itemId => itemMap.get(itemId))
        .filter((item): item is ShoppingListItem => !!item)
        .filter(item => !(item.nameExport && item.nameExport.trim().match(/^-+$/)));
      
      if (hideCompleted) {
        itemsToRender = itemsToRender.filter(item => item.amount !== '0');
      }

      if (itemsToRender.length === 0) return '';

      const categoryTitle = `## ${category.name}`;
      const itemList = itemsToRender.map(item => {
        const checkbox = item.amount === '0' ? '[x]' : '[ ]';
        const displayName = getClipboardDisplayName(item);
        return `- ${checkbox} ${displayName}`;
      }).join('\n');
      return `${categoryTitle}\n${itemList}`;
    }).filter(Boolean).join('\n\n');

    if (!markdownString.trim()) {
      alert(t('alerts.clipboard.nothingToCopy'));
      return;
    }

    navigator.clipboard.writeText(markdownString).then(() => {
      alert(t('alerts.clipboard.markdownSuccess'));
    }).catch(err => {
      console.error('Failed to copy markdown: ', err);
      alert(t('alerts.clipboard.genericError'));
    });
  }, [data.shopCategories, itemMap, hideCompleted, t]);

  const handleCopyUncheckedItemsToClipboard = useCallback(() => {
    const categoriesToCopy = data.shopCategories;

    // Use getVisibleCategories to respect hideUntilReset, but pass hideCompleted=true to filter out checked items
    const visibleCategories = getVisibleCategories(categoriesToCopy, itemMap, true);

    const uncheckedItems: string[] = [];
    visibleCategories.forEach(category => {
      category.itemIds.forEach(itemId => {
        const item = itemMap.get(itemId);
        if (item && item.amount !== '0' && !(item.nameExport && item.nameExport.trim().match(/^-+$/))) {
          const displayName = getClipboardDisplayName(item);
          uncheckedItems.push(displayName);
        }
      });
    });

    if (uncheckedItems.length === 0) {
      alert(t('alerts.clipboard.noUncheckedItems'));
      return;
    }

    const textToCopy = uncheckedItems.join('\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      alert(t('alerts.clipboard.uncheckedSuccess'));
    }).catch(err => {
      console.error('Failed to copy unchecked items: ', err);
      alert(t('alerts.clipboard.genericError'));
    });
  }, [data.shopCategories, itemMap, t]);
  
  const handleAutoEditComplete = useCallback(() => setItemToAutoEditId(null), []);

  const confirmRestoreModalContent = useMemo(() => (
    <p>{t('confirmModal.restore.message')}</p>
  ), [t]);

  const handleExportLocalStorage = useCallback(() => {
    const allKeys = storageService.getAllKeys();
    if (allKeys.length === 0) {
        alert('localStorage is empty.');
        return;
    }

    const localStorageData: Record<string, string | null> = {};
    for (const key of allKeys) {
        localStorageData[key] = storageService.getRawItem(key);
    }

    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const hh = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const timestamp = `${yy}${mm}${dd}${hh}${min}`;
    const filename = `lys-localstorage-${timestamp}.json`;

    const dataStr = JSON.stringify(localStorageData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    downloaderService.downloadBlob(dataBlob, filename);
  }, []);

  return (
    <LongPressProvider>
        <AppView
          theme={theme}
          setTheme={setTheme}
          isSettingsOpen={isSettingsOpen}
          handleOpenSettings={handleOpenSettings}
          handleCloseSettings={handleCloseSettings}
          isHelpModalOpen={isHelpModalOpen}
          handleOpenHelpModal={handleOpenHelpModal}
          handleCloseHelpModal={handleCloseHelpModal}
          mode={mode}
          setMode={handleModeChange}
          backupIntervalHours={backupIntervalHours}
          setBackupIntervalHours={setBackupIntervalHours}
          hideCompleted={isSearching ? false : hideCompleted}
          handleToggleHideCompleted={handleToggleHideCompleted}
          showOnlyUrgent={showOnlyUrgent}
          handleToggleShowOnlyUrgent={handleToggleShowOnlyUrgent}
          showOnlyDefaultCompleted={showOnlyDefaultCompleted}
          handleToggleShowOnlyDefaultCompleted={handleToggleShowOnlyDefaultCompleted}
          newItemDefaultCompleted={newItemDefaultCompleted}
          setNewItemDefaultCompleted={setNewItemDefaultCompleted}
          advancedMode={advancedMode}
          setAdvancedMode={setAdvancedMode}
          enableSplitItemNames={enableSplitItemNames}
          setEnableSplitItemNames={setEnableSplitItemNames}
          data={data}
          itemMap={itemMap}
          currentCategories={categoriesForList}
          allCurrentCategories={currentCategories}
          allShopCategories={data.shopCategories}
          allHomeCategories={data.homeCategories}
          handleReset={handleResetWithUrgent}
          rerunLogicTests={rerunLogicTests}
          runUITests={runUITests}
          handleUndo={handleUndo}
          handleRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          handleAddItem={addItemAndClearSearch}
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
          handleToggleHideUntilReset={handleToggleHideUntilReset}
          updateCurrentCategoryName={updateCurrentCategoryName}
          handleBackup={handleBackup}
          handleRestoreClick={handleRestoreClick}
          fileInputRef={fileInputRef}
          addItemInputRef={addItemInputRef}
          handleFileChange={handleFileChange}
          handleReorderCategory={handleReorderCategory}
          handleAddCategory={handleAddCategory}
          handleDeleteCategory={handleDeleteCategory}
          handleUpdateCategoryName={handleUpdateCategoryName}
          handleAddCategoryAndMoveItem={handleAddCategoryAndMoveItem}
          handleCopyMarkdownToClipboard={handleCopyMarkdownToClipboard}
          handleCopyUncheckedItemsToClipboard={handleCopyUncheckedItemsToClipboard}
          onExportLocalStorage={handleExportLocalStorage}
          testStatus={testStatus}
          showTestOverlay={showTestOverlay}
          testResults={testResults}
          totalTests={totalTests}
          handleCloseTestOverlay={handleCloseTestOverlay}
          lastRunSuiteType={lastRunSuiteType}
          needsReload={needsReload}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onClearSearch={handleClearSearch}
          lastBackupTimestamp={lastBackupTimestamp}
          isUiTestCountdownActive={isUiTestCountdownActive}
          cancelAutomaticUiTests={cancelAutomaticUiTests}
          startScheduledUiTestsNow={startScheduledUiTestsNow}
          itemToAutoEditId={itemToAutoEditId}
          onAutoEditComplete={handleAutoEditComplete}
          handleAddDemoData={handleAddDemoData}
          handleConvertHiddenSections={handleConvertHiddenSections}
          confirmRestoreState={confirmRestoreState}
          handleConfirmRestore={handleConfirmRestore}
          handleCloseConfirmRestore={handleCloseConfirmRestore}
          confirmRestoreModalTitle={t('confirmModal.restore.title')}
          confirmRestoreModalConfirmText={t('confirmModal.restore.confirm')}
          confirmRestoreModalContent={confirmRestoreModalContent}
          lastInteractedInHomeViewId={lastInteractedInHomeViewId}
          onSetLastInteractedInHomeViewId={setLastInteractedInHomeViewId}
        />
    </LongPressProvider>
  );
};


const App: React.FC = () => {
    return (
        <LocalizationProvider>
            <AppContent />
        </LocalizationProvider>
    )
}

export default App;