const FILE_PATH = 'common/hooks/effects/useBodyScrollLock.ts';
import { useEffect, useRef } from 'react';

// Class to add to body to prevent scrolling
const SCROLL_LOCK_CLASS = 'body-scroll-lock';

// Counter to manage multiple scroll lock requests. This ensures that if multiple
// modals are open, the scroll lock is not removed until the last one is closed.
let lockCounter = 0;

/**
 * A hook to lock body scrolling and restore focus when the lock is released.
 * Manages multiple concurrent lock requests.
 * @param {boolean} isLocked - Whether the scroll lock should be active for the calling component.
 */
export const useBodyScrollLock = (isLocked: boolean) => {
    const triggerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isLocked) {
            // A lock is being applied. Save the currently focused element
            // so we can restore focus to it when the lock is released.
            if (document.activeElement instanceof HTMLElement) {
                triggerRef.current = document.activeElement;
            }

            lockCounter++;
            if (lockCounter === 1) {
                document.body.classList.add(SCROLL_LOCK_CLASS);
            }

            // Return a cleanup function for when this specific lock is released.
            return () => {
                lockCounter--;
                if (lockCounter === 0) {
                    document.body.classList.remove(SCROLL_LOCK_CLASS);
                }

                // Restore focus to the element that was focused before the lock.
                // A timeout ensures this happens after the UI has updated.
                setTimeout(() => {
                    triggerRef.current?.focus();
                }, 0);
            };
        }
    }, [isLocked]);
};
