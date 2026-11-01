const FILE_PATH =
  'testing/suites/services/pwaService.test.suite.ts';
import { runLogicTest } from '../../helpers.ts';
import {
  getPwaThemeColor,
  getPwaManifestPath,
  isServiceWorkerSupported,
  isStandaloneDisplayMode,
  registerPwaServiceWorker,
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
  ];
}
