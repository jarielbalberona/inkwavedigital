import "reflect-metadata";
import { container } from "tsyringe";
import { createLogger } from "@inkwave/utils";
import { createDbConnection } from "@inkwave/db";

// Infrastructure
import { DrizzleOrderRepository } from "../infrastructure/persistence/DrizzleOrderRepository.js";
import { DrizzleMenuRepository } from "../infrastructure/persistence/DrizzleMenuRepository.js";
import { DrizzleVenueRepository } from "../infrastructure/persistence/DrizzleVenueRepository.js";
import { DrizzleTenantRepository } from "../infrastructure/persistence/DrizzleTenantRepository.js";
import { DrizzleSuperAdminRepository } from "../infrastructure/persistence/DrizzleSuperAdminRepository.js";
import { DrizzleUserRepository } from "../infrastructure/persistence/DrizzleUserRepository.js";
import { DrizzleVenueStaffRepository } from "../infrastructure/persistence/DrizzleVenueStaffRepository.js";
import { DrizzleImageLibraryRepository } from "../infrastructure/persistence/DrizzleImageLibraryRepository.js";
import { WebSocketManager } from "../infrastructure/websocket/WebSocketManager.js";
import { R2StorageService } from "../infrastructure/storage/R2StorageService.js";

// Use Cases
import { CreateOrderUseCase } from "../application/use-cases/CreateOrderUseCase.js";
import { UpdateOrderStatusUseCase } from "../application/use-cases/UpdateOrderStatusUseCase.js";
import { GetMenuUseCase } from "../application/use-cases/GetMenuUseCase.js";
import { GetVenueOrdersUseCase } from "../application/use-cases/GetVenueOrdersUseCase.js";
import { GetDeviceOrdersUseCase } from "../application/use-cases/GetDeviceOrdersUseCase.js";
import { GetVenueTablesUseCase } from "../application/use-cases/GetVenueTablesUseCase.js";
import { CreateTableUseCase } from "../application/use-cases/CreateTableUseCase.js";
import { UpdateTableUseCase } from "../application/use-cases/UpdateTableUseCase.js";
import { DeleteTableUseCase } from "../application/use-cases/DeleteTableUseCase.js";
import { CreateTenantUseCase } from "../application/use-cases/admin/CreateTenantUseCase.js";
import { GetCategoriesUseCase } from "../application/use-cases/GetCategoriesUseCase.js";
import { CreateCategoryUseCase } from "../application/use-cases/CreateCategoryUseCase.js";
import { UpdateCategoryUseCase } from "../application/use-cases/UpdateCategoryUseCase.js";
import { DeleteCategoryUseCase } from "../application/use-cases/DeleteCategoryUseCase.js";
import { CreateMenuItemUseCase } from "../application/use-cases/CreateMenuItemUseCase.js";
import { GetCategoryItemsUseCase } from "../application/use-cases/GetCategoryItemsUseCase.js";
import { GetVenueInfoUseCase } from "../application/use-cases/GetVenueInfoUseCase.js";
import { GetVenuesUseCase } from "../application/use-cases/GetVenuesUseCase.js";
import { CreateVenueUseCase } from "../application/use-cases/CreateVenueUseCase.js";
import { UpdateVenueUseCase } from "../application/use-cases/UpdateVenueUseCase.js";
import { DeleteVenueUseCase } from "../application/use-cases/DeleteVenueUseCase.js";
import { UploadImageUseCase } from "../application/use-cases/UploadImageUseCase.js";
import { GetImagesUseCase } from "../application/use-cases/GetImagesUseCase.js";
import { DeleteImageUseCase } from "../application/use-cases/DeleteImageUseCase.js";

// Controllers
import { HealthController } from "../interfaces/controllers/health.controller.js";
import { OrderController } from "../interfaces/controllers/order.controller.js";
import { MenuController } from "../interfaces/controllers/menu.controller.js";
import { VenueController } from "../interfaces/controllers/venue.controller.js";
import { AdminController } from "../interfaces/controllers/admin.controller.js";
import { AuthController } from "../interfaces/controllers/auth.controller.js";
import { ImageController } from "../interfaces/controllers/image.controller.js";

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

container.register("ITenantRepository", {
  useClass: DrizzleTenantRepository,
});

container.register("DrizzleSuperAdminRepository", {
  useClass: DrizzleSuperAdminRepository,
});

container.register("IUserRepository", {
  useClass: DrizzleUserRepository,
});

container.register("IVenueStaffRepository", {
  useClass: DrizzleVenueStaffRepository,
});

container.register("IImageLibraryRepository", {
  useClass: DrizzleImageLibraryRepository,
});

// Register storage service
container.register("R2StorageService", {
  useClass: R2StorageService,
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

container.register("GetDeviceOrdersUseCase", {
  useClass: GetDeviceOrdersUseCase,
});

container.register("GetVenueTablesUseCase", {
  useClass: GetVenueTablesUseCase,
});

container.register("CreateTableUseCase", {
  useClass: CreateTableUseCase,
});

container.register("UpdateTableUseCase", {
  useClass: UpdateTableUseCase,
});

container.register("DeleteTableUseCase", {
  useClass: DeleteTableUseCase,
});

container.register("CreateTenantUseCase", {
  useClass: CreateTenantUseCase,
});

container.register("GetCategoriesUseCase", {
  useClass: GetCategoriesUseCase,
});

container.register("CreateCategoryUseCase", {
  useClass: CreateCategoryUseCase,
});

container.register("UpdateCategoryUseCase", {
  useClass: UpdateCategoryUseCase,
});

container.register("DeleteCategoryUseCase", {
  useClass: DeleteCategoryUseCase,
});

container.register("CreateMenuItemUseCase", {
  useClass: CreateMenuItemUseCase,
});

container.register("GetCategoryItemsUseCase", {
  useClass: GetCategoryItemsUseCase,
});

container.register("GetVenueInfoUseCase", {
  useClass: GetVenueInfoUseCase,
});

container.register("GetVenuesUseCase", {
  useClass: GetVenuesUseCase,
});

container.register("CreateVenueUseCase", {
  useClass: CreateVenueUseCase,
});

container.register("UpdateVenueUseCase", {
  useClass: UpdateVenueUseCase,
});

container.register("DeleteVenueUseCase", {
  useClass: DeleteVenueUseCase,
});

container.register("UploadImageUseCase", {
  useClass: UploadImageUseCase,
});

container.register("GetImagesUseCase", {
  useClass: GetImagesUseCase,
});

container.register("DeleteImageUseCase", {
  useClass: DeleteImageUseCase,
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

container.register("AdminController", {
  useClass: AdminController,
});

container.register("AuthController", {
  useClass: AuthController,
});

container.register("ImageController", {
  useClass: ImageController,
});

// Register WebSocket manager
container.register("WebSocketManager", {
  useClass: WebSocketManager,
});

logger.info("Database connection initialized");

export { container };
