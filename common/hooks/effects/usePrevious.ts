const FILE_PATH = 'common/hooks/effects/usePrevious.ts';
import { useEffect, useRef } from 'react';

// Custom hook to track previous value
export const usePrevious = <T,>(value: T): T | undefined => {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};