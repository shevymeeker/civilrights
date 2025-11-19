// src/PWUpdatePrompt.jsx
import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function PWUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker registered.', r);
    },
    onRegisterError(error) {
      console.log('Service Worker registration error!', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (offlineReady) {
    // This fires when the app is ready to work offline for the first time
    // You could show a "Ready to work offline" toast here
    // For now, we'll just auto-close it.
    console.log('App is ready to work offline.');
    setTimeout(close, 5000); // Auto-hide "offline ready"
  }

  if (needRefresh) {
    // This fires when a new version is downloaded and ready
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="p-4 rounded-lg bg-slate-800 border-2 border-blue-500 shadow-xl text-slate-100">
          <div className="mb-2">A new version is available!</div>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            onClick={() => updateServiceWorker(true)}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default PWUpdatePrompt;
