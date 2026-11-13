const FILE_PATH =
  'testing/suites/services/pwaService.test.suite.ts';
import sinon from 'sinon';
import { runLogicTest } from '../../helpers.ts';
import {
  getPwaThemeColor,
  getPwaManifestPath,
  isServiceWorkerSupported,
  isStandaloneDisplayMode,
  registerPwaServiceWorker,
  unregisterPwaServiceWorkers,
} from '../../../common/services/pwaService.ts';
import {
  assertEquals,
} from '../../../common/testing/services/tests/helpers.ts';

const testPwaThemeColor = () => {
  const color = getPwaThemeColor();
  assertEquals(
    color,
    '#ea580c',
    'Theme color must match orange brand'
  );
};

const testPwaManifestPath = () => {
  const path = getPwaManifestPath();
  assertEquals(
    path,
    '/manifest.webmanifest',
    'Manifest path must be /manifest.webmanifest'
  );
};

const testIsServiceWorkerSupported = () => {
  const supported = isServiceWorkerSupported();
  assertEquals(
    typeof supported,
    'boolean',
    'isServiceWorkerSupported should return boolean'
  );
};

const testIsStandaloneDisplayMode = () => {
  const standalone = isStandaloneDisplayMode();
  assertEquals(
    typeof standalone,
    'boolean',
    'isStandaloneDisplayMode should return boolean'
  );
};

const testRegisterPwaServiceWorkerGraceful = async () => {
  const result = await registerPwaServiceWorker('/sw.js');
  assertEquals(
    typeof result,
    'boolean',
    'Registration should return boolean without throwing'
  );
};

const testUnregisterSwAndClearLysCaches = async () => {
  const unreg1 = sinon.stub().resolves(true);
  const unreg2 = sinon.stub().resolves(true);
  const deleteCache = sinon.stub().resolves(true);

  const result = await unregisterPwaServiceWorkers({
    serviceWorker: {
      getRegistrations: async () => [
        { unregister: unreg1 },
        { unregister: unreg2 },
      ],
    },
    caches: {
      keys: async () => [
        'lysi-cache-v1',
        'lysi-cache-v2',
        'other-app-cache',
      ],
      delete: deleteCache,
    },
  });

  assertEquals(
    result,
    true,
    'Cleanup should return true on success'
  );
  assertEquals(
    unreg1.callCount,
    1,
    'First registration should be unregistered'
  );
  assertEquals(
    unreg2.callCount,
    1,
    'Second registration should be unregistered'
  );
  assertEquals(
    deleteCache.callCount,
    2,
    'Only lysi-cache-* caches should be deleted'
  );
  assertEquals(
    deleteCache.calledWith('lysi-cache-v1'),
    true,
    'lysi-cache-v1 should be deleted'
  );
  assertEquals(
    deleteCache.calledWith('lysi-cache-v2'),
    true,
    'lysi-cache-v2 should be deleted'
  );
  assertEquals(
    deleteCache.calledWith('other-app-cache'),
    false,
    'Non-lysi caches must not be deleted'
  );
};

const testUnregisterSwHandlesErrors = async () => {
  const result = await unregisterPwaServiceWorkers({
    serviceWorker: {
      getRegistrations: async () => {
        throw new Error('Cleanup failed');
      },
    },
  });
  assertEquals(
    result,
    false,
    'Cleanup should return false on error'
  );
};

export function pwaServiceTestSuite() {
  const SUITE_NAME = pwaServiceTestSuite.name;
  return [
    runLogicTest(
      'PWA Service: returns valid theme color',
      testPwaThemeColor,
      SUITE_NAME,
      FILE_PATH
    ),
    runLogicTest(
      'PWA Service: returns valid manifest path',
      testPwaManifestPath,
      SUITE_NAME,
      FILE_PATH
    ),
    runLogicTest(
      'PWA Service: checks service worker support safely',
      testIsServiceWorkerSupported,
      SUITE_NAME,
      FILE_PATH
    ),
    runLogicTest(
      'PWA Service: checks standalone mode safely',
      testIsStandaloneDisplayMode,
      SUITE_NAME,
      FILE_PATH
    ),
    runLogicTest(
      'PWA Service: handles registration safely',
      testRegisterPwaServiceWorkerGraceful,
      SUITE_NAME,
      FILE_PATH
    ),
    runLogicTest(
      'PWA Service: unregisters SW and clears lysi caches',
      testUnregisterSwAndClearLysCaches,
      SUITE_NAME,
      FILE_PATH
    ),
    runLogicTest(
      'PWA Service: handles unregister errors safely',
      testUnregisterSwHandlesErrors,
      SUITE_NAME,
      FILE_PATH
    ),
  ];
}
