import "reflect-metadata";
import { container } from "tsyringe";
import { createLogger } from "@inkwave/utils";
import { createDbConnection } from "@inkwave/db";

// Infrastructure
import { DrizzleOrderRepository } from "../../apps/api/dist/infrastructure/persistence/DrizzleOrderRepository.js";
import { DrizzleMenuRepository } from "../../apps/api/dist/infrastructure/persistence/DrizzleMenuRepository.js";
import { DrizzleVenueRepository } from "../../apps/api/dist/infrastructure/persistence/DrizzleVenueRepository.js";

// Use Cases
import { CreateOrderUseCase } from "../../apps/api/dist/application/use-cases/CreateOrderUseCase.js";
import { UpdateOrderStatusUseCase } from "../../apps/api/dist/application/use-cases/UpdateOrderStatusUseCase.js";
import { GetMenuUseCase } from "../../apps/api/dist/application/use-cases/GetMenuUseCase.js";
import { GetVenueOrdersUseCase } from "../../apps/api/dist/application/use-cases/GetVenueOrdersUseCase.js";

// Controllers
import { HealthController } from "../../apps/api/dist/interfaces/controllers/health.controller.js";
import { OrderController } from "../../apps/api/dist/interfaces/controllers/order.controller.js";
import { MenuController } from "../../apps/api/dist/interfaces/controllers/menu.controller.js";

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

logger.info("Database connection initialized");

export { container };
