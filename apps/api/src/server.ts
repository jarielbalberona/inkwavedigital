import "reflect-metadata";
// Load environment variables FIRST
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (two levels up from dist/)
config({ path: path.resolve(__dirname, "../../../.env") });

// NOW initialize Sentry (after env vars are loaded)
import { initializeSentry } from "./infrastructure/monitoring/sentry.js";
initializeSentry();

import "./container/index.js";
import { app } from "./infrastructure/http/app.js";
import { createLogger } from "@inkwave/utils";
import { container } from "tsyringe";
import { WebSocketManager } from "./infrastructure/websocket/WebSocketManager.js";

config();

const logger = createLogger("server");
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 API server running on http://localhost:${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
});

// Initialize WebSocket server
const wsManager = container.resolve(WebSocketManager);
wsManager.initialize(server);

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

