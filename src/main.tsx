import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAutoUpdater } from './utils/autoUpdater';

// Initialize React App
createRoot(document.getElementById('root')!).render(<App />);

// Initialize Real-Time Auto Updater (handles 1-refresh & app-reopen updates)
initAutoUpdater();
