import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";

export function initializeSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn("VITE_SENTRY_DSN not configured, skipping Sentry initialization");
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE || "development",
    
    // Performance Monitoring
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    tracesSampleRate: import.meta.env.MODE === "production" ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Filter sensitive data
    beforeSend(event) {
      // Remove sensitive form data
      if (event.request?.data) {
        const sanitized = { ...event.request.data } as any;
        delete sanitized.password;
        delete sanitized.token;
        delete sanitized.apiKey;
        event.request.data = sanitized;
      }
      
      return event;
    },
    
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      "chrome-extension://",
      "moz-extension://",
      // Network errors
      "NetworkError",
      "Failed to fetch",
      // React errors that are handled
      "ResizeObserver loop limit exceeded",
    ],
  });

  console.log("Sentry initialized for Dashboard");
}

// Set user context from Clerk
export function setUserContext(user: { id: string; email?: string; tenantId?: string }): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    tenantId: user.tenantId,
  });
}

export function clearUserContext(): void {
  Sentry.setUser(null);
}

// Export Sentry for use in components
export { Sentry };

