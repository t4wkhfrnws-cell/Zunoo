import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

// Note: React.StrictMode is intentionally not used here. Leaflet maps
// (react-leaflet) initialize an imperative map instance per container, and
// StrictMode's deliberate double-invoke in development can leave a map
// container in an "already initialized" state.

const container = document.getElementById('root');
if (!container) {
  throw new Error('Zuuno could not start: #root element is missing.');
}

createRoot(container).render(
  <AppProvider>
    <App />
  </AppProvider>,
);
