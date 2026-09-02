const FILE_PATH = 'common/longPressTooltip/LongPressProvider.tsx';
import React, { createContext, useState, useCallback, useContext } from 'react';
import { useLongPress } from './hooks/useLongPress.ts';
import { useLongPressDebug } from './hooks/useLongPressDebug.ts';
import HelpTooltip from './components/HelpTooltip.tsx';
import type { TooltipData, TooltipContent, LongPressEventHandlers } from './types/index.ts';

const LongPressContext = createContext<LongPressEventHandlers | null>(null);

export const useLongPressTooltip = () => {
    const context = useContext(LongPressContext);
    if (context === null) {
        throw new Error('useLongPressTooltip must be used within a LongPressProvider');
    }
    return context;
}

export const LongPressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    
    useLongPressDebug();

    const handleLongPress = useCallback((element: HTMLElement) => {
        const helpText = element.title;
        if (helpText) {
            const content: TooltipContent = { helpText };
            setTooltip({
                content,
                targetRect: element.getBoundingClientRect(),
            });
        }
    }, []);

    const longPressHandlers = useLongPress(handleLongPress, { delay: 400 });

    return (
        <LongPressContext.Provider value={longPressHandlers}>
            {children}
            <HelpTooltip tooltip={tooltip} setTooltip={setTooltip} />
        </LongPressContext.Provider>
    );
};
