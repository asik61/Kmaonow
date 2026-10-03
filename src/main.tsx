import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

// Register & Update Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Force check for updates on reload
      reg.update().catch(console.warn);
    }).catch((err) => {
      console.log('SW registration note:', err);
    });
  });
}
