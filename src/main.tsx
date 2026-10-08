import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import { initAutoUpdater } from './utils/autoUpdater';

// Initialize React App
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallbackTitle="Real Money App Reload Ho Raha Hai">
    <App />
  </ErrorBoundary>
);

// Initialize Real-Time Auto Updater (handles 1-refresh & app-reopen updates)
initAutoUpdater();
