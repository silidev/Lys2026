// common/hooks/useAutobackup.ts
import { useEffect, useCallback } from 'react';
import downloaderService from '../services/downloader.ts';
import storageService from '../services/storageService.ts';
import type { ShoppingListData } from '../../types.ts';

interface UseAutobackupOptions {
  filenamePrefix: string;
  timestampKey: string;
}

export const useAutobackup = (
  intervalHours: number,
  getBackupData: () => ShoppingListData,
  options: UseAutobackupOptions
) => {
  const { filenamePrefix, timestampKey } = options;

  const performBackup = useCallback(() => {
    try {
      const backupData = getBackupData();
      // A simple check to see if there are items to back up.
      if (backupData.items.length === 0) {
          return;
      }
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const filename = `${filenamePrefix}_backup_${crypto.randomUUID().substring(0, 8)}.json`;
      downloaderService.downloadBlob(blob, filename);
      // Also update the manual backup timestamp to reset the timer after an auto-backup
      storageService.setItem(timestampKey, Date.now());
      window.dispatchEvent(new CustomEvent('lys:backup-complete'));
    } catch (error: unknown) {
      console.error("Autobackup failed:", error);
    }
  }, [getBackupData, filenamePrefix, timestampKey]);

  useEffect(() => {
    if (intervalHours <= 0) {
      return;
    }

    const checkBackup = () => {
      const lastBackupTimestamp = storageService.getItem<number>(timestampKey);
      const intervalMs = intervalHours * 60 * 60 * 1000;

      if (lastBackupTimestamp) {
        // Timestamp exists, check if interval has passed.
        if (Date.now() - lastBackupTimestamp > intervalMs) {
          performBackup();
        }
      } else {
        // No timestamp. This is the first time.
        // Set the timestamp so the next check will be against this time.
        storageService.setItem(timestampKey, Date.now());
      }
    };

    checkBackup(); // Run once on mount.
    const intervalId = setInterval(checkBackup, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(intervalId);
  }, [intervalHours, timestampKey, performBackup]);
};