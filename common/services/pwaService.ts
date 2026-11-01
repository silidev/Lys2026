const FILE_PATH = 'common/services/pwaService.ts';

/**
 * Returns the theme color specified for the PWA.
 */
export function getPwaThemeColor(): string {
  return '#ea580c';
}

/**
 * Returns the path to the PWA Web App Manifest.
 */
export function getPwaManifestPath(): string {
  return '/manifest.webmanifest';
}

/**
 * Checks whether the browser environment supports
 * Service Workers.
 */
export function isServiceWorkerSupported(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return 'serviceWorker' in navigator;
}

/**
 * Detects whether the web application is running in
 * standalone (installed PWA) display mode.
 */
export function isStandaloneDisplayMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const matchMediaResult =
    window.matchMedia?.('(display-mode: standalone)')?.matches;
  const nav = window.navigator as {
    standalone?: boolean;
  };
  return Boolean(matchMediaResult || nav?.standalone);
}

/**
 * Registers the Service Worker for offline support
 * and PWA installability.
 */
export async function registerPwaServiceWorker(
  swPath: string = '/sw.js'
): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false;
  }
  try {
    const registration =
      await navigator.serviceWorker.register(swPath);
    return Boolean(registration);
  } catch {
    return false;
  }
}
