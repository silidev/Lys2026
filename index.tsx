const FILE_PATH = 'index.tsx';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import {
  registerPwaServiceWorker,
} from './common/services/pwaService.ts';

// Register PWA service worker for installability
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    void registerPwaServiceWorker();
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