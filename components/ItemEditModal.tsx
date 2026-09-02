const FILE_PATH = 'components/ItemEditModal.tsx';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ShoppingListItem, ViewMode } from '../types.ts';
import { IconTrash, IconCheck, IconFolder, IconArrowsPointingOut, IconArrowsPointingIn, IconDuplicate } from '../common/components/icons/index.ts';
import { useBodyScrollLock } from '../common/hooks/effects/useBodyScrollLock.ts';
import { usePrevious } from '../common/hooks/effects/usePrevious.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import ConfirmModal from './ConfirmModal.tsx';
import { useLocalization } from '../localization/i18n.ts';
import AmountControl from './AmountControl.tsx';

interface ItemEditModalProps {
  item: ShoppingListItem;
  onClose: () => void;
  onUpdateItem: (id: string, updates: Partial<Pick<ShoppingListItem, 'name' | 'amount' | 'nameShop' | 'alias' | 'nameExport'>>) => void;
  onDeleteItem: (id: string) => void;
  onCloneItem: (id: string) => void;
  onToggleDefaultCompleted: (id: string) => void;
  onToggleItemUrgent: (id: string) => void;
  onToggleItemUrgentOnce: (id: string) => void;
  onToggleHideUntilReset: (id: string) => void;
  onMoveRequest: (mode: ViewMode) => void;
  advancedMode: boolean;
  enableSplitItemNames: boolean;
  isChildModalOpen?: boolean;
}

const ItemEditModal: React.FC<ItemEditModalProps> = ({ 
    item,
    onClose,
    onUpdateItem,
    onDeleteItem,
    onCloneItem,
    onToggleDefaultCompleted,
    onToggleItemUrgent,
    onToggleItemUrgentOnce,
    onToggleHideUntilReset,
    onMoveRequest,
    advancedMode,
    enableSplitItemNames,
    isChildModalOpen = false,
 }) => {
  useBodyScrollLock(!isChildModalOpen);
  const { t } = useLocalization();

  useEffect(() => {
    const handleResize = () => {
      window.scrollTo(0, 0);
    };

    const preventTouchMove = (e: globalThis.TouchEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('textarea')) {
          return;
      }
      e.preventDefault();
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }
    if (!isChildModalOpen) {
        document.body.addEventListener("touchmove", preventTouchMove, { passive: false });
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
      document.body.removeEventListener("touchmove", preventTouchMove);
    };
  }, [isChildModalOpen]);
  
  const [name, setName] = useState(item.name);
  const [nameShop, setNameShop] = useState(item.nameShop || '');
  const [alias, setAlias] = useState(item.alias || '');
  const [nameExport, setNameExport] = useState(item.nameExport || '');
  const [amount, setAmount] = useState(item.amount || '');
  const [isRushOnce, setIsRushOnce] = useState(!!item.isRushOnce);
  const [hideUntilReset, setHideUntilReset] = useState(!!item.hideUntilReset);
  const [isNameFullscreen, setIsNameFullscreen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const nameInputRef = useRef<HTMLTextAreaElement>(null);
  const fullscreenNameInputRef = useRef<HTMLTextAreaElement>(null);
  const prevItem = usePrevious(item);
  const prevIsNameFullscreen = usePrevious(isNameFullscreen);
  const longPressHandlers = useLongPressTooltip();

  // Effect for managing fullscreen state focus
  useEffect(() => {
    if (isNameFullscreen) {
      fullscreenNameInputRef.current?.focus();
    } else if (prevIsNameFullscreen) { // This means we are coming FROM fullscreen
      nameInputRef.current?.focus();
    }
  }, [isNameFullscreen, prevIsNameFullscreen]);

  // Effect for managing item change and initial focus
  useEffect(() => {
    const hasJustOpened = !prevItem || prevItem.id !== item.id;
    
    if (hasJustOpened) {
        setName(item.name);
        setNameShop(item.nameShop || '');
        setAlias(item.alias || '');
        setNameExport(item.nameExport || '');
        setAmount(item.amount || '');
        setIsRushOnce(!!item.isRushOnce);
        setHideUntilReset(!!item.hideUntilReset);
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
    }
  }, [item, prevItem]);

  const handleSave = () => {
    const newName = name.trim();
    const newNameShop = nameShop.trim();
    const newAlias = alias.trim();
    const newNameExport = nameExport.trim();
    const newAmount = amount.trim();

    if (newName) { // An item must have a name to be valid
        const nameChanged = newName !== item.name;
        const nameShopChanged = newNameShop !== (item.nameShop || '');
        const aliasChanged = newAlias !== (item.alias || '');
        const nameExportChanged = newNameExport !== (item.nameExport || '');
        const amountChanged = newAmount !== (item.amount || '');
        if (nameChanged || amountChanged || nameShopChanged || aliasChanged || nameExportChanged) {
            onUpdateItem(item.id, { name: newName, amount: newAmount, nameShop: newNameShop, alias: newAlias, nameExport: newNameExport });
        }
    }

    if (isRushOnce !== !!item.isRushOnce) {
        onToggleItemUrgentOnce(item.id);
    }
    if (hideUntilReset !== !!item.hideUntilReset) {
        onToggleHideUntilReset(item.id);
    }

    onClose();
  };

  const handleDelete = () => {
    setIsConfirmDeleteOpen(true);
  };
  
  const handleConfirmDelete = () => {
    onDeleteItem(item.id);
    onClose();
  };

  const handleClone = () => {
    onCloneItem(item.id);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
    } else if (e.key === 'Escape') {
      handleSave();
    }
  };

  const displayName = [item.amount, item.name].filter(Boolean).join(' ').trim();

  const handleAmountUpdate = (delta: number) => {
    let currentValue: number;
    const parsedAmount = parseInt(amount || 'not a number', 10);
    
    if (!isNaN(parsedAmount)) {
        currentValue = parsedAmount;
    } else {
        currentValue = item.amount === '0' ? 0 : 1;
    }

    const newValue = currentValue + delta;
    setAmount(String(newValue));
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-item-title"
      >
        <div
          className="bg-white dark:bg-gray-900 w-full h-full flex flex-col overflow-hidden pb-[env(keyboard-inset-bottom,0px)]"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <h2 id="edit-item-title" className="text-lg font-bold dark:text-white">{t('itemEditModal.title')}</h2>
            <button
              onClick={handleSave}
              className="flex items-center justify-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-green-500 transition"
              title={t('itemEditModal.tooltips.save')}
              {...longPressHandlers}
            >
              <IconCheck className="h-5 w-5 mr-2" />
              {t('itemEditModal.save')}
            </button>
          </header>

          <main className="p-4 space-y-4 flex-1 flex flex-col overflow-y-auto">
            <div>
              <label htmlFor="item-name-input" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">{t(enableSplitItemNames ? 'itemEditModal.itemNameHomeLabel' : 'itemEditModal.itemNameLabel')}</label>
              <div className="relative">
                <textarea
                    id="item-name-input"
                    ref={nameInputRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    className="w-full p-2 pr-10 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none transition dark:text-white resize-none"
                    title={t('itemEditModal.tooltips.itemName')}
                    {...longPressHandlers}
                />
                <button
                    type="button"
                    onClick={() => setIsNameFullscreen(true)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    aria-label={t('itemEditModal.aria.fullscreen')}
                    title={t('itemEditModal.tooltips.fullscreen')}
                    {...longPressHandlers}
                >
                    <IconArrowsPointingOut className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex items-start pt-2">
              <div className={`flex flex-col space-y-4 ${advancedMode ? 'w-1/3' : 'flex-grow'}`}>
                  <div className="flex items-center">
                      <input
                        id={`reset-behavior-once-${item.id}`}
                        name={`reset-behavior-${item.id}`}
                        type="radio"
                        checked={!!item.defaultCompleted}
                        onChange={() => {
                            if (!item.defaultCompleted) onToggleDefaultCompleted(item.id);
                        }}
                        className="h-5 w-5 border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 cursor-pointer"
                        title={t('itemEditModal.tooltips.seldomNeeded')}
                        {...longPressHandlers}
                      />
                      <label 
                        htmlFor={`reset-behavior-once-${item.id}`}
                        className="ml-2 select-none text-sm text-gray-700 dark:text-white cursor-pointer"
                        title={t('itemEditModal.tooltips.seldomNeeded')}
                        {...longPressHandlers}
                      >
                        <b>{t('itemEditModal.seldomNeeded')}</b>
                      </label>
                  </div>
                  <div className="flex items-center">
                      <input
                        id={`reset-behavior-always-${item.id}`}
                        name={`reset-behavior-${item.id}`}
                        type="radio"
                        checked={!item.defaultCompleted}
                        onChange={() => {
                            if (item.defaultCompleted) onToggleDefaultCompleted(item.id);
                        }}
                        className="h-5 w-5 border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 cursor-pointer"
                        title={t('itemEditModal.tooltips.oftenNeeded')}
                        {...longPressHandlers}
                      />
                      <label 
                        htmlFor={`reset-behavior-always-${item.id}`}
                        className="ml-2 select-none text-sm text-gray-700 dark:text-white cursor-pointer"
                        title={t('itemEditModal.tooltips.oftenNeeded')}
                        {...longPressHandlers}
                      >
                        <b>{t('itemEditModal.oftenNeeded')}</b>
                      </label>
                  </div>
              </div>
              
              {advancedMode && (
                  <div className="w-1/3 flex flex-col items-start justify-start pl-4 space-y-4">
                      <div className="flex items-center">
                          <input
                            id="is-urgent-checkbox"
                            data-testid="item-edit-urgent-checkbox"
                            type="checkbox"
                            checked={!!item.isRush}
                            onChange={() => onToggleItemUrgent(item.id)}
                            className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 cursor-pointer"
                            {...longPressHandlers}
                            title={t('itemEditModal.tooltips.urgentAlways')}
                          />
                          <label
                            htmlFor="is-urgent-checkbox"
                            className="ml-2 select-none text-sm text-gray-700 dark:text-white cursor-pointer"
                            title={t('itemEditModal.tooltips.urgentAlways')}
                            {...longPressHandlers}
                          >
                              <strong>{t('itemEditModal.urgentAlways')}</strong>
                          </label>
                      </div>
                      <div className="flex items-center">
                          <input
                              id="is-urgent-once-checkbox"
                              data-testid="item-edit-urgent-once-checkbox"
                              type="checkbox"
                              checked={isRushOnce}
                              onChange={(e) => setIsRushOnce(e.target.checked)}
                              className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 cursor-pointer"
                              {...longPressHandlers}
                              title={t('itemEditModal.tooltips.urgentThisTime')}
                          />
                          <label
                              htmlFor="is-urgent-once-checkbox"
                              className="ml-2 select-none text-sm text-gray-700 dark:text-white cursor-pointer"
                              title={t('itemEditModal.tooltips.urgentThisTime')}
                              {...longPressHandlers}
                          >
                              <strong>{t('itemEditModal.urgentThisTime')}</strong>
                          </label>
                      </div>
                  </div>
              )}

              {advancedMode && (
                  <div className="w-1/3 flex flex-col items-end space-y-4">
                      <div className="flex items-center">
                          <input
                              id="hide-until-reset-checkbox"
                              type="checkbox"
                              checked={hideUntilReset}
                              onChange={(e) => setHideUntilReset(e.target.checked)}
                              className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 cursor-pointer"
                              {...longPressHandlers}
                              title={t('itemEditModal.tooltips.hideUntilReset')}
                          />
                          <label
                              htmlFor="hide-until-reset-checkbox"
                              className="ml-2 select-none text-sm text-gray-700 dark:text-white cursor-pointer"
                              title={t('itemEditModal.tooltips.hideUntilReset')}
                              {...longPressHandlers}
                          >
                              <strong>{t('itemEditModal.hideUntilReset')}</strong>
                          </label>
                      </div>
                  </div>
              )}
            </div>

            <div>
                <label htmlFor="item-amount-input" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">{t('itemEditModal.amountLabel')}</label>
                <div className="flex gap-2 items-center">
                    <div className="w-1/3 flex justify-center">
                        <AmountControl
                            id="item-amount-input"
                            amountToDisplay={amount || (item.amount === '0' ? '0' : '1')}
                            onIncrease={() => handleAmountUpdate(1)}
                            onDecrease={() => handleAmountUpdate(-1)}
                            displayName={name}
                        />
                    </div>
                    {!item.defaultCompleted && (
                        <button
                            id="select-home-category-button"
                            type="button"
                            onClick={() => onMoveRequest('home')}
                            className="w-1/3 flex items-center justify-center px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-blue-500 text-center"
                            title={t('itemEditModal.tooltips.selectHomeCategory')}
                            {...longPressHandlers}
                        >
                            <IconFolder className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span className="break-words">{t('itemEditModal.selectHomeCategory')}</span>
                        </button>
                    )}
                    <button
                        id="select-shop-category-button"
                        type="button"
                        onClick={() => onMoveRequest('shop')}
                        className={`${item.defaultCompleted ? 'w-2/3' : 'w-1/3'} flex items-center justify-center px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-blue-500 text-center`}
                        title={t('itemEditModal.tooltips.selectShopCategory')}
                        {...longPressHandlers}
                    >
                        <IconFolder className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span className="break-words">{t('itemEditModal.selectShopCategory')}</span>
                    </button>
                </div>
            </div>

            {enableSplitItemNames && (
                <div>
                    <label htmlFor="item-name-shop-input" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">{t('itemEditModal.itemNameShopLabel')}</label>
                    <textarea
                        id="item-name-shop-input"
                        value={nameShop}
                        onChange={(e) => setNameShop(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={2}
                        className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none transition dark:text-white resize-none"
                        placeholder={name}
                        title={t('itemEditModal.tooltips.itemNameShop')}
                        {...longPressHandlers}
                    />
                </div>
            )}
            
            <div>
                <label htmlFor="item-alias-input" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">{t('itemEditModal.aliasLabel')}</label>
                <textarea
                    id="item-alias-input"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none transition dark:text-white resize-none"
                    title={t('itemEditModal.tooltips.alias')}
                    {...longPressHandlers}
                />
            </div>
            
            <div>
                <label htmlFor="item-name-export-input" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">{t('itemEditModal.nameExportLabel')}</label>
                <textarea
                    id="item-name-export-input"
                    value={nameExport}
                    onChange={(e) => setNameExport(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none transition dark:text-white resize-none"
                    title={t('itemEditModal.tooltips.nameExport')}
                    {...longPressHandlers}
                />
            </div>

            <div className="flex items-center justify-between mt-auto border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  id="clone-item-button"
                  type="button"
                  onClick={handleClone}
                  className="flex items-center justify-center px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-gray-500 transition"
                  title={t('itemEditModal.tooltips.clone')}
                  {...longPressHandlers}
                >
                  <IconDuplicate className="h-4 w-4 mr-2" />
                  {t('itemEditModal.clone')}
                </button>
                <button
                  id="delete-item-button"
                  onClick={handleDelete}
                  className="flex items-center justify-center px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-red-500 transition"
                  title={t('itemEditModal.tooltips.delete')}
                  {...longPressHandlers}
                >
                  <IconTrash className="h-5 w-5 mr-2" />
                  {t('itemEditModal.delete')}
                </button>
            </div>
          </main>
        </div>
      </div>
      {isNameFullscreen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex flex-col p-4"
             role="dialog"
             aria-modal="true"
             aria-labelledby="fullscreen-edit-title">
          <header className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 id="fullscreen-edit-title" className="text-lg font-bold text-white">{t('itemEditModal.itemNameLabel')}</h2>
            <button 
                onClick={() => setIsNameFullscreen(false)} 
                className="p-2 rounded-full text-white hover:bg-white/20"
                aria-label={t('itemEditModal.aria.exitFullscreen')}
                title={t('itemEditModal.tooltips.exitFullscreen')}
                {...longPressHandlers}
            >
                <IconArrowsPointingIn className="h-6 w-6" />
            </button>
          </header>
          <div className="flex-1 flex">
            <textarea
                ref={fullscreenNameInputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-full bg-transparent text-white text-xl p-2 focus:outline-none resize-none"
            />
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('itemEditModal.confirmDelete.title')}
        confirmText={t('itemEditModal.delete')}
      >
        <p>{t('itemEditModal.confirmDelete.message', displayName)}</p>
      </ConfirmModal>
    </>,
    document.body
  );
};

export default ItemEditModal;