import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createIDBPersister } from './lib/queryPersister';
import { initializeSentry, Sentry } from './lib/sentry';
import App from "./App";
import "./index.css";

// Initialize Sentry before anything else
initializeSentry();

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";
console.log("CLERK_PUBLISHABLE_KEY", CLERK_PUBLISHABLE_KEY);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const persister = createIDBPersister('inkwave-dashboard-cache');

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary 
      fallback={({ error }) => (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      )}
    >
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
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
      </ClerkProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);

