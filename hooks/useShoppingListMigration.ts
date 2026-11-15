const FILE_PATH = 'hooks/useShoppingListMigration.ts';
import { useCallback, useRef, useState } from 'react';
import {
  migrateAndAuditLocalStorage,
} from '../common/services/localStorageMigrationService.ts';
import type {
  StartupMigrationResult,
} from '../common/services/localStorageAuditTypes.ts';

export const useShoppingListMigration = () => {
  const migrationRef = useRef<StartupMigrationResult | null>(
    null
  );
  if (migrationRef.current === null) {
    migrationRef.current = migrateAndAuditLocalStorage();
  }

  const [isModalOpen, setIsModalOpen] = useState<boolean>(
    () => (migrationRef.current?.findings.length ?? 0) > 0
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    findings: migrationRef.current.findings,
    hasCorruptListData:
      migrationRef.current.hasCorruptListData,
    isModalOpen,
    closeModal,
  };
};
