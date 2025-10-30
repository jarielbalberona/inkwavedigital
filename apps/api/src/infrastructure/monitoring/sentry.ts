import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { createLogger, slackNotifier } from "@inkwave/utils";

const logger = createLogger("sentry");

export function initializeSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    logger.warn("SENTRY_DSN not configured, skipping Sentry initialization");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
    release: process.env.SENTRY_RELEASE || "api@0.1.0",
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    integrations: [
      Sentry.httpIntegration({ trackIncomingRequestsAsSessions: true }),  // HTTP/Express
      Sentry.postgresIntegration(),               // PostgreSQL
      nodeProfilingIntegration(),                 // Profiling
    ],
    
    // Filter out sensitive data and send Slack notifications
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      
      // Remove sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.data) {
            const sanitized = { ...breadcrumb.data };
            delete sanitized.password;
            delete sanitized.token;
            delete sanitized.apiKey;
            return { ...breadcrumb, data: sanitized };
          }
          return breadcrumb;
        });
      }
      
      // Send Slack notification for errors
      if (event.level === "error" || event.level === "fatal") {
        const error = hint?.originalException as Error;
        if (error) {
          const sentryUrl = event.event_id 
            ? `https://sentry.io/organizations/YOUR_ORG/issues/?query=${event.event_id}`
            : undefined;
          
          slackNotifier.notifyError(error, {
            eventId: event.event_id,
            transaction: event.transaction,
            user: event.user,
          }, sentryUrl).catch(err => {
            logger.error({ error: err }, "Failed to send Slack notification");
          });
        }
      }
      
      return event;
    },
    
    // Ignore common errors
    ignoreErrors: [
      "Non-Error exception captured",
      "Non-Error promise rejection captured",
      /^NetworkError/,
    ],
  });

  logger.info({ 
    environment: process.env.SENTRY_ENVIRONMENT || "development",
    release: process.env.SENTRY_RELEASE || "api@0.1.0"
  }, "Sentry initialized");
}

// Export Sentry for use in application
export { Sentry };

// Helper functions
export function captureException(error: Error, context?: Record<string, any>): string {
  return Sentry.captureException(error, { 
    extra: context 
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info", context?: Record<string, any>): string {
  return Sentry.captureMessage(message, { 
    level, 
    extra: context 
  });
}

export function setUser(user: { id: string; email?: string; tenantId?: string }): void {
  Sentry.setUser(user);
}

export function clearUser(): void {
  Sentry.setUser(null);
}

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  Sentry.addBreadcrumb(breadcrumb);
}

