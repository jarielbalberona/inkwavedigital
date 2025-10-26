import "reflect-metadata";
import "./container/index.js";
import { config } from "dotenv";
import { app } from "./infrastructure/http/app.js";
import { createLogger } from "@inkwave/utils";
import { container } from "tsyringe";
// import { WebSocketManager } from "./infrastructure/websocket/WebSocketManager.js";

config();

const logger = createLogger("server");
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 API server running on http://localhost:${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
});

// Initialize WebSocket server (temporarily disabled)
// const wsManager = container.resolve(WebSocketManager);
// wsManager.initialize(server);

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

