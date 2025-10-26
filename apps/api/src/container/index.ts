import "reflect-metadata";
import { container } from "tsyringe";
import { createLogger } from "@inkwave/utils";
import { createDbConnection } from "@inkwave/db";

// Infrastructure
import { DrizzleOrderRepository } from "../infrastructure/persistence/DrizzleOrderRepository.js";
import { DrizzleMenuRepository } from "../infrastructure/persistence/DrizzleMenuRepository.js";
import { DrizzleVenueRepository } from "../infrastructure/persistence/DrizzleVenueRepository.js";
// import { WebSocketManager } from "../infrastructure/websocket/WebSocketManager.js";

// Use Cases
import { CreateOrderUseCase } from "../application/use-cases/CreateOrderUseCase.js";
import { UpdateOrderStatusUseCase } from "../application/use-cases/UpdateOrderStatusUseCase.js";
import { GetMenuUseCase } from "../application/use-cases/GetMenuUseCase.js";
import { GetVenueOrdersUseCase } from "../application/use-cases/GetVenueOrdersUseCase.js";
import { GetVenueTablesUseCase } from "../application/use-cases/GetVenueTablesUseCase.js";

// Controllers
import { HealthController } from "../interfaces/controllers/health.controller.js";
import { OrderController } from "../interfaces/controllers/order.controller.js";
import { MenuController } from "../interfaces/controllers/menu.controller.js";
import { VenueController } from "../interfaces/controllers/venue.controller.js";

// Register logger
const logger = createLogger("api");
container.register("Logger", {
  useValue: logger,
});

// Register database connection
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/inkwave";
const db = createDbConnection(DATABASE_URL);
container.register("Database", {
  useValue: db,
});

// Register repositories
container.register("IOrderRepository", {
  useClass: DrizzleOrderRepository,
});

container.register("IMenuRepository", {
  useClass: DrizzleMenuRepository,
});

container.register("IVenueRepository", {
  useClass: DrizzleVenueRepository,
});

// Register use cases
container.register("CreateOrderUseCase", {
  useClass: CreateOrderUseCase,
});

container.register("UpdateOrderStatusUseCase", {
  useClass: UpdateOrderStatusUseCase,
});

container.register("GetMenuUseCase", {
  useClass: GetMenuUseCase,
});

container.register("GetVenueOrdersUseCase", {
  useClass: GetVenueOrdersUseCase,
});

container.register("GetVenueTablesUseCase", {
  useClass: GetVenueTablesUseCase,
});

// Register controllers
container.register("HealthController", {
  useClass: HealthController,
});

container.register("OrderController", {
  useClass: OrderController,
});

container.register("MenuController", {
  useClass: MenuController,
});

container.register("VenueController", {
  useClass: VenueController,
});

// Register WebSocket manager (temporarily disabled)
// container.register("WebSocketManager", {
//   useClass: WebSocketManager,
// });

logger.info("Database connection initialized");

export { container };
