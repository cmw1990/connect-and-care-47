import React from 'react';
import ReactDOM from 'react-dom/client';
import { App as CapacitorApp } from '@capacitor/app';
import { Dialog } from '@capacitor/dialog';
import { MobilePreview } from './components/mobile/MobilePreview';
import './index.css';

// Handle hardware back button
CapacitorApp.addListener('backButton', async ({ canGoBack }) => {
  if (!canGoBack) {
    const { value } = await Dialog.confirm({
      title: 'Confirm Exit',
      message: 'Are you sure you want to exit the app?',
      okButtonTitle: 'Yes',
      cancelButtonTitle: 'No',
    });

    if (value) {
      CapacitorApp.exitApp();
    }
  } else {
    window.history.back();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MobilePreview />
  </React.StrictMode>,
);
