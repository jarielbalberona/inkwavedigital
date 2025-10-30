import { injectable, inject } from "tsyringe";
import type { Request, Response } from "express";
import type { HealthCheckResponse } from "@inkwave/types";
import { container } from "tsyringe";
import { createLogger } from "@inkwave/utils";
import { WebSocketManager } from "../../infrastructure/websocket/WebSocketManager.js";

const logger = createLogger("health");

interface DetailedHealthResponse {
  status: "ok" | "degraded";
  timestamp: string;
  details?: {
    database: { status: string; message?: string };
    websocket: { status: string; connections: number };
    memory: { rss: string; heapUsed: string; heapTotal: string };
    uptime: string;
    version: string;
  };
}

@injectable()
export class HealthController {
  async check(_req: Request, res: Response): Promise<void> {
    const response: HealthCheckResponse = {
      status: "ok",
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  }

  async detailed(_req: Request, res: Response): Promise<void> {
    const checks = await this.performHealthChecks();
    const overallStatus = checks.database.status === "healthy" ? "healthy" : "degraded";

    const response: DetailedHealthResponse = {
      status: overallStatus === "healthy" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      details: {
        ...checks,
        memory: this.getMemoryUsage(),
        uptime: this.getUptime(),
        version: process.env.npm_package_version || "0.1.0",
      },
    };

    const statusCode = overallStatus === "healthy" ? 200 : 503;
    res.status(statusCode).json(response);
  }

  async ready(_req: Request, res: Response): Promise<void> {
    // Readiness probe - checks if app is ready to receive traffic
    try {
      const dbCheck = await this.checkDatabase();
      if (dbCheck.status === "healthy") {
        res.status(200).json({ status: "ready" });
      } else {
        res.status(503).json({ status: "not ready", reason: "database unavailable" });
      }
    } catch (error) {
      res.status(503).json({ status: "not ready", reason: "health check failed" });
    }
  }

  async live(_req: Request, res: Response): Promise<void> {
    // Liveness probe - checks if app is alive (not deadlocked)
    res.status(200).json({ status: "alive" });
  }

  private async performHealthChecks() {
    const [database, websocket] = await Promise.all([
      this.checkDatabase(),
      this.checkWebSocket(),
    ]);

    return { database, websocket };
  }

  private async checkDatabase(): Promise<{ status: string; message?: string }> {
    try {
      // Simple check - we'll import drizzle client if needed
      // For now, return healthy if no errors
      return { status: "healthy" };
    } catch (error) {
      logger.error({ error }, "Database health check failed");
      return { 
        status: "unhealthy", 
        message: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  private async checkWebSocket(): Promise<{ status: string; connections: number }> {
    try {
      const wsManager = container.resolve(WebSocketManager);
      // Assume WebSocket is healthy if manager exists
      return { status: "healthy", connections: 0 }; // TODO: Add connection count to WebSocketManager
    } catch (error) {
      return { status: "unhealthy", connections: 0 };
    }
  }

  private getMemoryUsage(): { rss: string; heapUsed: string; heapTotal: string } {
    const usage = process.memoryUsage();
    return {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
    };
  }

  private getUptime(): string {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  }
}

