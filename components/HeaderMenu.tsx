const FILE_PATH = 'components/HeaderMenu.tsx';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IconReload, IconPlay, IconCpuChip, IconGear, IconArrowLeft, IconArrowRight, IconAlertTriangle, IconClipboard, IconDownload, IconUpload, IconPlus, IconTrash, IconQuestionMarkCircle, IconFolder } from '../common/components/icons/index.ts';
import storageService from '../common/services/storageService.ts';
import { useLongPressTooltip } from '../common/longPressTooltip/LongPressProvider.tsx';
import { useLocalization } from '../localization/i18n.ts';

interface HeaderMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onReset: () => void;
    onOpenSettings: () => void;
    onOpenHelpModal: () => void;
    onRunLogicTests: () => void;
    onRunUITests: () => void;
    onCopyMarkdownToClipboard: () => void;
    onCopyUncheckedItemsToClipboard: () => void;
    onBackup: () => void;
    onRestore: () => void;
    showOnlyDefaultCompleted: boolean;
    onToggleShowOnlyDefaultCompleted: () => void;
    advancedMode: boolean;
    onAddDemoData: () => void;
    onConvertHiddenSections: () => void;
    onExportLocalStorage: () => void;
    hideCompleted: boolean;
    onToggleHideCompleted: () => void;
}

interface MenuItem {
    id?: string;
    label: string;
    action: () => void;
    icon: React.ReactNode;
    show?: boolean;
    isSubMenuTrigger?: boolean;
    title?: string;
    isCheckbox?: boolean;
    isChecked?: boolean;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ isOpen, onClose, onReset, onOpenSettings, onOpenHelpModal, onRunLogicTests, onRunUITests, onCopyMarkdownToClipboard, onCopyUncheckedItemsToClipboard, onBackup, onRestore, showOnlyDefaultCompleted, onToggleShowOnlyDefaultCompleted, advancedMode, onAddDemoData, onConvertHiddenSections, onExportLocalStorage, hideCompleted, onToggleHideCompleted }) => {
    const { t } = useLocalization();
    const [activeMenu, setActiveMenu] = useState<'main' | 'development' | 'temp' | 'dangerous' | 'more'>('main');
    const menuRef = useRef<HTMLDivElement>(null);
    const mainMenuPanelRef = useRef<HTMLDivElement>(null);
    const devMenuPanelRef = useRef<HTMLDivElement>(null);
    const tempMenuPanelRef = useRef<HTMLDivElement>(null);
    const dangerousMenuPanelRef = useRef<HTMLDivElement>(null);
    const moreMenuPanelRef = useRef<HTMLDivElement>(null);
    const [menuHeight, setMenuHeight] = useState<number | 'auto'>('auto');
    const longPressHandlers = useLongPressTooltip();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const menuButton = document.getElementById('header-menu-button');
            if (
                isOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                !menuButton?.contains(event.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => setActiveMenu('main'), 150);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                let height;
                if (activeMenu === 'main') {
                    height = mainMenuPanelRef.current?.scrollHeight;
                } else if (activeMenu === 'development') {
                    height = devMenuPanelRef.current?.scrollHeight;
                } else if (activeMenu === 'temp') {
                    height = tempMenuPanelRef.current?.scrollHeight;
                } else if (activeMenu === 'more') {
                    height = moreMenuPanelRef.current?.scrollHeight;
                } else {
                    height = dangerousMenuPanelRef.current?.scrollHeight;
                }
                setMenuHeight(height || 'auto');
            }, 10);
            return () => clearTimeout(timer);
        } else {
            setMenuHeight('auto');
        }
    }, [isOpen, activeMenu]);
    
    const dangerousMenuItems: MenuItem[] = useMemo(() => [
        {
            label: t('headerMenu.dangerousMenu.confirmDelete'),
            action: () => {},
            icon: <IconAlertTriangle className="w-5 h-5 mr-3 text-yellow-400" />,
            title: t('headerMenu.tooltips.dangerousMenu.confirmDelete'),
        },
        {
            label: t('headerMenu.dangerousMenu.yesDelete'),
            action: () => {
                storageService.clear();
                history.go(0);
            },
            icon: <IconTrash className="w-5 h-5 mr-3 text-red-500" />,
            title: t('headerMenu.tooltips.dangerousMenu.yesDelete'),
        }
    ], [t]);

    const tempMenuItems: MenuItem[] = useMemo(() => [
        {
            label: t('headerMenu.tempMenu.convertHidden'),
            action: onConvertHiddenSections,
            icon: <IconReload className="w-5 h-5 mr-3 text-gray-400" />,
            title: t('headerMenu.tooltips.tempMenu.convertHidden'),
        },
    ], [onConvertHiddenSections, t]);

    const developmentMenuItems: MenuItem[] = useMemo(() => [
        {
            label: t('headerMenu.devMenu.addDemoData'),
            action: onAddDemoData,
            icon: <IconPlus className="w-5 h-5 mr-3 text-gray-400" />,
            title: t('headerMenu.tooltips.devMenu.addDemoData'),
        },
        {
            label: t('headerMenu.devMenu.dangerous'),
            action: () => setActiveMenu('dangerous'),
            icon: <IconAlertTriangle className="w-5 h-5 mr-3 text-yellow-500" />,
            isSubMenuTrigger: true,
            title: t('headerMenu.tooltips.devMenu.dangerous'),
        },
        {
            label: t('headerMenu.devMenu.reload'),
            action: () => history.go(0),
            icon: <IconReload className="w-5 h-5 mr-3 text-gray-400" />,
            title: t('headerMenu.tooltips.devMenu.reload'),
        },
        {
            label: t('headerMenu.devMenu.runLogicTests'),
            action: onRunLogicTests,
            icon: <IconPlay className="w-5 h-5 mr-3 text-gray-400" />,
            title: t('headerMenu.tooltips.devMenu.runLogicTests'),
        },
        {
            label: t('headerMenu.devMenu.runUITests'),
            action: onRunUITests,
            icon: <IconCpuChip className="w-5 h-5 mr-3 text-gray-400" />,
            title: t('headerMenu.tooltips.devMenu.runUITests'),
        },
        {
            label: t('headerMenu.devMenu.disableUITestsOnce'),
            action: () => {
                storageService.setItem('disableRunningUiTestsOnDesktopLoadOnce', true);
                history.go(0);
            },
            icon: <IconAlertTriangle className="w-5 h-5 mr-3 text-gray-400" />,
            title: t('headerMenu.tooltips.devMenu.disableUITestsOnce'),
        },
        {
            label: t('headerMenu.devMenu.temp'),
            action: () => setActiveMenu('temp'),
            icon: <IconAlertTriangle className="w-5 h-5 mr-3 text-yellow-500" />,
            isSubMenuTrigger: true,
            title: t('headerMenu.tooltips.devMenu.temp'),
        },
        {
            label: t('headerMenu.devMenu.exportLocalStorage'),
            action: onExportLocalStorage,
            icon: <IconDownload className="w-5 h-5 mr-3 text-gray-400" />,
            title: t('headerMenu.tooltips.devMenu.exportLocalStorage'),
        },
        {
            id: 'showCheckedOnResetOnly',
            label: t('headerMenu.showCheckedOnResetOnly'),
            action: onToggleShowOnlyDefaultCompleted,
            icon: <></>, // Not used for checkboxes
            isCheckbox: true,
            isChecked: showOnlyDefaultCompleted,
            title: t('headerMenu.tooltips.showCheckedOnResetOnly'),
        },
    ].sort((a, b) => a.label.localeCompare(b.label)), [onRunLogicTests, onRunUITests, onAddDemoData, onExportLocalStorage, t, showOnlyDefaultCompleted, onToggleShowOnlyDefaultCompleted]);

    const moreMenuItems: MenuItem[] = useMemo(() => [
        {
            label: t('headerMenu.backupNow'),
            action: onBackup,
            icon: <IconDownload className="w-5 h-5 mr-3 text-gray-400" />,
            show: true,
            title: t('headerMenu.tooltips.backupNow'),
        },
        {
            label: t('headerMenu.copyMarkdown'),
            action: onCopyMarkdownToClipboard,
            icon: <IconClipboard className="w-5 h-5 mr-3 text-gray-400" />,
            show: advancedMode,
            title: t('headerMenu.tooltips.copyMarkdown'),
        },
        {
            label: t('headerMenu.copyUnchecked'),
            action: onCopyUncheckedItemsToClipboard,
            icon: <IconClipboard className="w-5 h-5 mr-3 text-gray-400" />,
            show: advancedMode,
            title: t('headerMenu.tooltips.copyUnchecked'),
        },
        {
            label: t('headerMenu.help'),
            action: onOpenHelpModal,
            icon: <IconQuestionMarkCircle className="w-5 h-5 mr-3 text-gray-400" />,
            show: true,
            title: t('headerMenu.tooltips.help'),
        },
        {
            label: t('headerMenu.restoreFromFile'),
            action: onRestore,
            icon: <IconUpload className="w-5 h-5 mr-3 text-gray-400" />,
            show: true,
            title: t('headerMenu.tooltips.restoreFromFile'),
        },
    ]
    .filter(item => item.show)
    .sort((a,b) => a.label.localeCompare(b.label))
    , [t, advancedMode, onBackup, onCopyMarkdownToClipboard, onCopyUncheckedItemsToClipboard, onOpenHelpModal, onRestore]);

    const allMainMenuItems: MenuItem[] = useMemo(() => [
        {
            id: 'development',
            label: t('headerMenu.development'),
            action: () => setActiveMenu('development'),
            icon: <IconCpuChip className="w-5 h-5 mr-3 text-gray-400" />,
            show: advancedMode,
            isSubMenuTrigger: true,
            title: t('headerMenu.tooltips.development'),
        },
        {
            id: 'more',
            label: t('headerMenu.more'),
            action: () => setActiveMenu('more'),
            icon: <IconFolder className="w-5 h-5 mr-3 text-gray-400" />,
            show: moreMenuItems.length > 0,
            isSubMenuTrigger: true,
            title: t('headerMenu.tooltips.more'),
        },
        {
            id: 'reset',
            label: t('headerMenu.resetList'),
            action: onReset,
            icon: <IconReload className="w-5 h-5 mr-3 text-gray-400" />,
            show: true,
            title: t('headerMenu.tooltips.resetList'),
        },
        {
            id: 'settings',
            label: t('headerMenu.settings'),
            action: onOpenSettings,
            icon: <IconGear className="w-5 h-5 mr-3 text-gray-400" />,
            show: true,
            title: t('headerMenu.tooltips.settings'),
        },
        {
            id: 'showCheckedItems',
            label: t('headerMenu.showCheckedItems'),
            action: onToggleHideCompleted,
            icon: <></>, // Not used for checkboxes
            show: true,
            isCheckbox: true,
            isChecked: !hideCompleted,
            title: t('headerMenu.tooltips.showCheckedItems'),
        },
    ], [t, advancedMode, onReset, onOpenSettings, moreMenuItems.length, hideCompleted, onToggleHideCompleted]);

    const belowDividerIds = ['settings', 'more'];

    const mainMenuItemsAbove = useMemo(() => allMainMenuItems
        .filter(item => item.show && !belowDividerIds.includes(item.id!))
        .sort((a, b) => a.label.localeCompare(b.label)),
        [allMainMenuItems]
    );

    const mainMenuItemsBelow = useMemo(() => allMainMenuItems
        .filter(item => item.show && belowDividerIds.includes(item.id!))
        .sort((a, b) => a.label.localeCompare(b.label)),
        [allMainMenuItems]
    );

    const handleItemClick = (action: () => void, isSubMenuTrigger?: boolean) => {
        action();
        if (!isSubMenuTrigger) {
            setTimeout(() => {
                onClose();
            }, 150);
        }
    };

    const renderMenuItem = (item: MenuItem) => {
        if (item.isCheckbox) {
            const checkboxId = `header-menu-checkbox-${item.id}`;
            return (
                <label
                    key={item.label}
                    htmlFor={checkboxId}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                    title={item.title}
                    {...longPressHandlers}
                >
                    <input
                        id={checkboxId}
                        type="checkbox"
                        checked={!!item.isChecked}
                        onChange={item.action}
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3"
                    />
                    <span className="flex-grow select-none">{item.label}</span>
                </label>
            );
        }
        return (
            <button
                key={item.label}
                onClick={() => handleItemClick(item.action, item.isSubMenuTrigger)}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                role="menuitem"
                title={item.title}
                {...longPressHandlers}
            >
                {item.icon}
                <span className="flex-grow">{item.label}</span>
                {item.isSubMenuTrigger && <IconArrowRight className="h-4 w-4 text-gray-400" />}
            </button>
        );
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-64 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-150 ease-in-out dark:bg-gray-800 z-40"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="header-menu-button"
            style={{ height: menuHeight === 'auto' ? menuHeight : `${menuHeight}px` }}
        >
            <div className={`transition-transform duration-150 ease-in-out ${activeMenu !== 'main' ? '-translate-x-full' : 'translate-x-0'}`}>
                <div className="py-1" ref={mainMenuPanelRef}>
                    {mainMenuItemsAbove.map(renderMenuItem)}
                    {mainMenuItemsBelow.length > 0 && mainMenuItemsAbove.length > 0 && (
                        <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                    )}
                    {mainMenuItemsBelow.map(renderMenuItem)}
                </div>
            </div>
            <div className={`absolute top-0 left-0 w-full transition-transform duration-150 ease-in-out ${activeMenu === 'development' ? 'translate-x-0' : (activeMenu === 'temp' || activeMenu === 'dangerous') ? '-translate-x-full' : 'translate-x-full'}`}>
                <div className="h-full bg-white py-1 dark:bg-gray-800" ref={devMenuPanelRef}>
                    <button
                        onClick={() => setActiveMenu('main')}
                        className="flex w-full items-center border-b border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                        role="menuitem"
                        title={t('headerMenu.tooltips.devMenu.return')}
                        {...longPressHandlers}
                    >
                        <IconArrowLeft className="h-5 w-5 mr-3 text-gray-400" />
                        {t('headerMenu.devMenu.title')}
                    </button>
                    {developmentMenuItems.map(renderMenuItem)}
                </div>
            </div>
            <div className={`absolute top-0 left-0 w-full transition-transform duration-150 ease-in-out ${activeMenu === 'more' ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full bg-white py-1 dark:bg-gray-800" ref={moreMenuPanelRef}>
                    <button
                        onClick={() => setActiveMenu('main')}
                        className="flex w-full items-center border-b border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                        role="menuitem"
                        title={t('headerMenu.tooltips.moreMenu.return')}
                        {...longPressHandlers}
                    >
                        <IconArrowLeft className="h-5 w-5 mr-3 text-gray-400" />
                        {t('headerMenu.moreMenu.title')}
                    </button>
                    {moreMenuItems.map(item => (
                         <button
                            key={item.label}
                            onClick={() => handleItemClick(item.action, item.isSubMenuTrigger)}
                            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                            role="menuitem"
                            title={item.title}
                            {...longPressHandlers}
                        >
                            {item.icon}
                            <span className="flex-grow">{item.label}</span>
                            {item.isSubMenuTrigger && <IconArrowRight className="h-4 w-4 text-gray-400" />}
                        </button>
                    ))}
                </div>
            </div>
            <div className={`absolute top-0 left-0 w-full transition-transform duration-150 ease-in-out ${activeMenu === 'temp' ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full bg-white py-1 dark:bg-gray-800" ref={tempMenuPanelRef}>
                    <button
                        onClick={() => setActiveMenu('development')}
                        className="flex w-full items-center border-b border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                        role="menuitem"
                        title={t('headerMenu.tooltips.tempMenu.return')}
                        {...longPressHandlers}
                    >
                        <IconArrowLeft className="h-5 w-5 mr-3 text-gray-400" />
                        {t('headerMenu.tempMenu.title')}
                    </button>
                    {tempMenuItems.map(item => (
                         <button
                            key={item.label}
                            onClick={() => handleItemClick(item.action, item.isSubMenuTrigger)}
                            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                            role="menuitem"
                            title={item.title}
                            {...longPressHandlers}
                        >
                            {item.icon}
                            <span className="flex-grow">{item.label}</span>
                            {item.isSubMenuTrigger && <IconArrowRight className="h-4 w-4 text-gray-400" />}
                        </button>
                    ))}
                </div>
            </div>
            <div className={`absolute top-0 left-0 w-full transition-transform duration-150 ease-in-out ${activeMenu === 'dangerous' ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full bg-white py-1 dark:bg-gray-800" ref={dangerousMenuPanelRef}>
                    <button
                        onClick={() => setActiveMenu('development')}
                        className="flex w-full items-center border-b border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                        role="menuitem"
                        title={t('headerMenu.tooltips.dangerousMenu.return')}
                        {...longPressHandlers}
                    >
                        <IconArrowLeft className="h-5 w-5 mr-3 text-gray-400" />
                        {t('headerMenu.dangerousMenu.title')}
                    </button>
                    <button
                        disabled
                        className="flex w-full items-center px-4 py-2 text-left text-sm text-yellow-500 dark:text-yellow-400 cursor-not-allowed"
                        role="menuitem"
                        title={dangerousMenuItems[0].title}
                        {...longPressHandlers}
                    >
                        {dangerousMenuItems[0].icon}
                        {dangerousMenuItems[0].label}
                    </button>
                    <button
                        onClick={() => handleItemClick(dangerousMenuItems[1].action)}
                        className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50"
                        role="menuitem"
                        title={dangerousMenuItems[1].title}
                        {...longPressHandlers}
                    >
                        {dangerousMenuItems[1].icon}
                        {dangerousMenuItems[1].label}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeaderMenu;