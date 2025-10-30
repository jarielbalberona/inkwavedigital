import type { Request, Response, NextFunction } from "express";
import { createLogger } from "@inkwave/utils";
import * as Sentry from "@sentry/node";

const logger = createLogger("performance");

const SLOW_REQUEST_THRESHOLD_MS = parseInt(process.env.SLOW_REQUEST_THRESHOLD_MS || "1000", 10);

interface PerformanceMetrics {
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
}

// Store metrics in memory (consider using Redis for production)
const metricsBuffer: PerformanceMetrics[] = [];
const MAX_METRICS_BUFFER = 1000;

export function performanceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  // Capture original end function
  const originalEnd = res.end;
  
  // Override end function to capture response time
  res.end = function(chunk?: any, encoding?: any, callback?: any): any {
    const duration = Date.now() - start;
    
    // Add response time header
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    // Record metrics
    const metrics: PerformanceMetrics = {
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime: duration,
      timestamp: new Date(),
    };
    
    // Add to metrics buffer
    if (metricsBuffer.length >= MAX_METRICS_BUFFER) {
      metricsBuffer.shift(); // Remove oldest metric
    }
    metricsBuffer.push(metrics);
    
    // Log slow requests
    if (duration > SLOW_REQUEST_THRESHOLD_MS) {
      logger.warn({
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
        query: req.query,
      }, "Slow request detected");
      
      // Send to Sentry as performance issue
      Sentry.captureMessage(`Slow request: ${req.method} ${req.path} (${duration}ms)`, {
        level: "warning",
        tags: {
          type: "performance",
          method: req.method,
          path: req.path,
        },
        extra: {
          duration,
          statusCode: res.statusCode,
          threshold: SLOW_REQUEST_THRESHOLD_MS,
        },
      });
    }
    
    // Log all requests in development
    if (process.env.NODE_ENV === "development") {
      logger.debug({
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      }, "Request completed");
    }
    
    return originalEnd.call(res, chunk, encoding, callback);
  };
  
  next();
}

// Export metrics for monitoring endpoint
export function getPerformanceMetrics(): PerformanceMetrics[] {
  return [...metricsBuffer];
}

// Calculate average response time by endpoint
export function getAverageResponseTimes(): Record<string, number> {
  const grouped: Record<string, { total: number; count: number }> = {};
  
  metricsBuffer.forEach(metric => {
    const key = `${metric.method} ${metric.path}`;
    if (!grouped[key]) {
      grouped[key] = { total: 0, count: 0 };
    }
    grouped[key].total += metric.responseTime;
    grouped[key].count += 1;
  });
  
  const averages: Record<string, number> = {};
  Object.entries(grouped).forEach(([key, value]) => {
    averages[key] = Math.round(value.total / value.count);
  });
  
  return averages;
}

