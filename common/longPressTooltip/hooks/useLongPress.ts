const FILE_PATH = 'common/longPressTooltip/hooks/useLongPress.ts';
import React, { useRef, useCallback } from 'react';

type TouchEvent = React.TouchEvent<HTMLElement> | React.MouseEvent<HTMLElement>;
type LongPressCallback = (element: HTMLElement) => void;

export const useLongPress = (
    onLongPress: LongPressCallback,
    { delay = 400 } = {}
) => {
    const timeout = useRef<number | null>(null);
    const longPressTriggered = useRef(false);
    
    const start = useCallback((event: TouchEvent) => {
        const element = event.currentTarget as HTMLElement;
        longPressTriggered.current = false;

        // Clear any existing timeout on new start to prevent overlaps.
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        
        // In modern React, event objects are not pooled, so we don't need to persist them.
        timeout.current = window.setTimeout(() => {
            onLongPress(element);
            longPressTriggered.current = true;
        }, delay);
    }, [onLongPress, delay]);

    const clear = useCallback(() => {
        if (timeout.current) {
            clearTimeout(timeout.current);
            timeout.current = null; // Reset ref after clearing
        }
    }, []);

    // To prevent context menu on long press
    const handleContextMenu = (e: React.MouseEvent<HTMLElement>) => {
        if (longPressTriggered.current) {
            e.preventDefault();
        }
    };

    return {
        onTouchStart: start,
        onTouchEnd: clear,
        onTouchMove: clear,
        onTouchCancel: clear,
        // Also add mouse events for desktop debugging and consistency
        onMouseDown: start,
        onMouseUp: clear,
        onMouseLeave: clear,
        onContextMenu: handleContextMenu,
    };
};
