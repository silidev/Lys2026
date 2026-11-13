const FILE_PATH = 'index.tsx';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import {
  registerPwaServiceWorker,
  unregisterPwaServiceWorkers,
} from './common/services/pwaService.ts';

// Register PWA service worker only in production builds;
// in dev mode unregister any stale SW to avoid mixed
// Vite dependency chunks.
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (import.meta.env.PROD) {
      void registerPwaServiceWorker();
    } else {
      void unregisterPwaServiceWorkers();
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error(
    'Could not find root element to mount to'
  );
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);