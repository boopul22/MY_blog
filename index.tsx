
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { SupabaseBlogProvider } from './context/SupabaseBlogContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SupabaseBlogProvider>
          <App />
        </SupabaseBlogProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
