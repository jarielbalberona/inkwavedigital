import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createIDBPersister } from './lib/queryPersister';
import { initializeSentry, Sentry } from './lib/sentry';
import App from "./App";
import "./index.css";

// Initialize Sentry before anything else
initializeSentry();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const persister = createIDBPersister('inkwave-customer-cache');

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary 
      fallback={({ error }) => (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Oops! Something went wrong</h1>
          <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              marginTop: '1rem', 
              padding: '0.5rem 1rem', 
              background: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      )}
    >
      <PersistQueryClientProvider 
        client={queryClient}
        persistOptions={{ 
          persister,
          maxAge: 1000 * 60 * 60, // 1 hour
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistQueryClientProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);

