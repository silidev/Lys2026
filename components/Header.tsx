const FILE_PATH = 'components/Header.tsx';
import React, { useState } from 'react';
import { IconBars3, IconArrowUturnLeft, IconArrowUturnRight } from '../common/components/icons/index.ts';
import HeaderMenu from './HeaderMenu.tsx';
import type { ViewMode } from '../types.ts';
import ModeSwitcher from './ModeSwitcher.tsx';
import { AppConfig } from '../00configs/app.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

interface HeaderProps {
  onReset: () => void;
  onOpenSettings: () => void;
  onOpenHelpModal: () => void;
  onRunLogicTests: () => void;
  onRunUITests: () => void;
  hideCompleted: boolean;
  onToggleHideCompleted: () => void;
  showOnlyUrgent: boolean;
  onToggleShowOnlyUrgent: () => void;
  showOnlyDefaultCompleted: boolean;
  onToggleShowOnlyDefaultCompleted: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onBackup: () => void;
  onRestore: () => void;
  onCopyMarkdownToClipboard: () => void;
  onCopyUncheckedItemsToClipboard: () => void;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  advancedMode: boolean;
  onAddDemoData: () => void;
  onConvertHiddenSections: () => void;
  onExportLocalStorage: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onReset, 
    onOpenSettings, 
    onOpenHelpModal,
    onRunLogicTests, 
    onRunUITests, 
    hideCompleted, 
    onToggleHideCompleted,
    showOnlyUrgent,
    onToggleShowOnlyUrgent,
    showOnlyDefaultCompleted,
    onToggleShowOnlyDefaultCompleted,
    onUndo, 
    onRedo, 
    canUndo, 
    canRedo,
    onBackup,
    onRestore,
    onCopyMarkdownToClipboard,
    onCopyUncheckedItemsToClipboard,
    mode,
    onModeChange,
    advancedMode,
    onAddDemoData,
    onConvertHiddenSections,
    onExportLocalStorage,
}) => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const longPressHandlers = useLongPressTooltip();
    const { t } = useLocalization();

    const handleMenuToggle = () => {
        setMenuOpen(prev => !prev);
    };

    const getToggleButtonClass = (isActive: boolean) => {
        const base = "px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center";
        if (isActive) {
            return `${base} bg-orange-600 text-white shadow`;
        }
        return `${base} bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600`;
    };

    return (
        <header className={`sticky top-0 z-30 grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-t-lg bg-orange-600 py-2 text-white shadow-lg ${AppConfig.headerHeightClass} ${AppConfig.screenEdgeHorizontalPaddingClass}`}>
            {/* Column 1: Toggles */}
            {advancedMode ? (
                <div className="flex items-stretch gap-1 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg">
                    <button
                        id="urgent-toggle-button"
                        onClick={onToggleShowOnlyUrgent}
                        className={getToggleButtonClass(showOnlyUrgent)}
                        title={t('header.tooltips.urgent')}
                        aria-pressed={showOnlyUrgent}
                        {...longPressHandlers}
                    >
                        {t('header.urgent')}
                    </button>
                </div>
            ) : <div />}
            
            {/* Column 2: Mode Switcher */}
            <div className="flex justify-center">
                <ModeSwitcher mode={mode} onModeChange={onModeChange} />
            </div>

            {/* Column 3: Undo/Redo */}
            <div className="flex flex-row items-center justify-center gap-1">
                <button
                    id="undo-button"
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="p-1.5 rounded-full hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-orange-600 focus:ring-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t('header.aria.undo')}
                    title={t('header.tooltips.undo')}
                    {...longPressHandlers}
                >
                    <IconArrowUturnLeft className="h-5 w-5" />
                </button>
                <button
                    id="redo-button"
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="p-1.5 rounded-full hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-orange-600 focus:ring-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t('header.aria.redo')}
                    title={t('header.tooltips.redo')}
                    {...longPressHandlers}
                >
                    <IconArrowUturnRight className="h-5 w-5" />
                </button>
            </div>
                
            {/* Column 4: Menu */}
            <div className="flex flex-row items-center justify-end gap-1">
                <div className="relative">
                    <button
                        id="header-menu-button"
                        onClick={handleMenuToggle}
                        className="p-1.5 rounded-full hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-orange-600 focus:ring-white transition"
                        aria-label={t('header.aria.openMenu')}
                        aria-haspopup="true"
                        aria-expanded={isMenuOpen}
                        title={t('header.tooltips.openMenu')}
                        {...longPressHandlers}
                    >
                        <IconBars3 className="h-6 w-6" />
                    </button>
                    <HeaderMenu
                        isOpen={isMenuOpen}
                        onClose={() => setMenuOpen(false)}
                        onReset={onReset}
                        onOpenSettings={onOpenSettings}
                        onOpenHelpModal={onOpenHelpModal}
                        onRunLogicTests={onRunLogicTests}
                        onRunUITests={onRunUITests}
                        onBackup={onBackup}
                        onRestore={onRestore}
                        onCopyMarkdownToClipboard={onCopyMarkdownToClipboard}
                        onCopyUncheckedItemsToClipboard={onCopyUncheckedItemsToClipboard}
                        showOnlyDefaultCompleted={showOnlyDefaultCompleted}
                        onToggleShowOnlyDefaultCompleted={onToggleShowOnlyDefaultCompleted}
                        advancedMode={advancedMode}
                        onAddDemoData={onAddDemoData}
                        onConvertHiddenSections={onConvertHiddenSections}
                        onExportLocalStorage={onExportLocalStorage}
                        hideCompleted={hideCompleted}
                        onToggleHideCompleted={onToggleHideCompleted}
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;