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
        maskAllText: false, // Customer app - allow text for better debugging
        blockAllMedia: false,
      }),
    ],
    
    tracesSampleRate: import.meta.env.MODE === "production" ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Filter sensitive data
    beforeSend(event) {
      // Remove sensitive data from context
      if (event.contexts?.device) {
        delete (event.contexts.device as any).deviceId; // Don't send device ID to Sentry
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

  console.log("Sentry initialized for Customer PWA");
}

// Set device/session context
export function setDeviceContext(deviceId: string, venueId?: string, tableId?: string): void {
  Sentry.setContext("session", {
    deviceId,
    venueId,
    tableId,
  });
}

// Export Sentry for use in components
export { Sentry };

