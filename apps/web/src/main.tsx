import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MediaProvider } from '@mediaflow/react';

const API_KEY = import.meta.env.VITE_PEXELS_API_KEY || 'YOUR_API_KEY';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MediaProvider apiKey={API_KEY}>
      <App />
    </MediaProvider>
  </React.StrictMode>
);
