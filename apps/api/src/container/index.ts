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
import { DrizzlePushSubscriptionRepository } from "../infrastructure/persistence/DrizzlePushSubscriptionRepository.js";
import { WebSocketManager } from "../infrastructure/websocket/WebSocketManager.js";
import { R2StorageService } from "../infrastructure/storage/R2StorageService.js";
import { PushNotificationService } from "../infrastructure/push/PushNotificationService.js";

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
import { UpdateTenantUseCase } from "../application/use-cases/admin/UpdateTenantUseCase.js";
import { UpdateTenantSettingsUseCase } from "../application/use-cases/admin/UpdateTenantSettingsUseCase.js";
import { GetTenantSettingsUseCase } from "../application/use-cases/admin/GetTenantSettingsUseCase.js";
import { GetCategoriesUseCase } from "../application/use-cases/GetCategoriesUseCase.js";
import { CreateCategoryUseCase } from "../application/use-cases/CreateCategoryUseCase.js";
import { UpdateCategoryUseCase } from "../application/use-cases/UpdateCategoryUseCase.js";
import { DeleteCategoryUseCase } from "../application/use-cases/DeleteCategoryUseCase.js";
import { CreateMenuItemUseCase } from "../application/use-cases/CreateMenuItemUseCase.js";
import { GetCategoryItemsUseCase } from "../application/use-cases/GetCategoryItemsUseCase.js";
import { GetVenueInfoUseCase } from "../application/use-cases/GetVenueInfoUseCase.js";
import { GetVenuesUseCase } from "../application/use-cases/GetVenuesUseCase.js";
import { GetVenueBySlugUseCase } from "../application/use-cases/GetVenueBySlugUseCase.js";
import { CreateVenueUseCase } from "../application/use-cases/CreateVenueUseCase.js";
import { UpdateVenueUseCase } from "../application/use-cases/UpdateVenueUseCase.js";
import { DeleteVenueUseCase } from "../application/use-cases/DeleteVenueUseCase.js";
import { UploadImageUseCase } from "../application/use-cases/UploadImageUseCase.js";
import { GetImagesUseCase } from "../application/use-cases/GetImagesUseCase.js";
import { DeleteImageUseCase } from "../application/use-cases/DeleteImageUseCase.js";
import { CreateItemOptionUseCase } from "../application/use-cases/CreateItemOptionUseCase.js";
import { UpdateItemOptionUseCase } from "../application/use-cases/UpdateItemOptionUseCase.js";
import { DeleteItemOptionUseCase } from "../application/use-cases/DeleteItemOptionUseCase.js";
import { GetItemOptionsUseCase } from "../application/use-cases/GetItemOptionsUseCase.js";
import { CreateItemOptionValueUseCase } from "../application/use-cases/CreateItemOptionValueUseCase.js";
import { UpdateItemOptionValueUseCase } from "../application/use-cases/UpdateItemOptionValueUseCase.js";
import { DeleteItemOptionValueUseCase } from "../application/use-cases/DeleteItemOptionValueUseCase.js";
import { GetActiveMenuUseCase } from "../application/use-cases/GetActiveMenuUseCase.js";
import { CreateMenuUseCase } from "../application/use-cases/CreateMenuUseCase.js";
import { SubscribeToPushNotificationsUseCase } from "../application/use-cases/SubscribeToPushNotificationsUseCase.js";
import { UnsubscribeFromPushNotificationsUseCase } from "../application/use-cases/UnsubscribeFromPushNotificationsUseCase.js";

// Controllers
import { HealthController } from "../interfaces/controllers/health.controller.js";
import { OrderController } from "../interfaces/controllers/order.controller.js";
import { MenuController } from "../interfaces/controllers/menu.controller.js";
import { VenueController } from "../interfaces/controllers/venue.controller.js";
import { AdminController } from "../interfaces/controllers/admin.controller.js";
import { AuthController } from "../interfaces/controllers/auth.controller.js";
import { ImageController } from "../interfaces/controllers/image.controller.js";
import { WebhookController } from "../interfaces/controllers/webhook.controller.js";

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

container.register("PushSubscriptionRepository", {
  useClass: DrizzlePushSubscriptionRepository,
});

// Register storage service
container.register("R2StorageService", {
  useClass: R2StorageService,
});

// Register push notification service
container.register("PushNotificationService", {
  useClass: PushNotificationService,
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

container.register("UpdateTenantUseCase", {
  useClass: UpdateTenantUseCase,
});

container.register("UpdateTenantSettingsUseCase", {
  useClass: UpdateTenantSettingsUseCase,
});

container.register("GetTenantSettingsUseCase", {
  useClass: GetTenantSettingsUseCase,
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

container.register("GetVenueBySlugUseCase", {
  useClass: GetVenueBySlugUseCase,
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

container.register("CreateItemOptionUseCase", {
  useClass: CreateItemOptionUseCase,
});

container.register("UpdateItemOptionUseCase", {
  useClass: UpdateItemOptionUseCase,
});

container.register("DeleteItemOptionUseCase", {
  useClass: DeleteItemOptionUseCase,
});

container.register("GetItemOptionsUseCase", {
  useClass: GetItemOptionsUseCase,
});

container.register("CreateItemOptionValueUseCase", {
  useClass: CreateItemOptionValueUseCase,
});

container.register("UpdateItemOptionValueUseCase", {
  useClass: UpdateItemOptionValueUseCase,
});

container.register("DeleteItemOptionValueUseCase", {
  useClass: DeleteItemOptionValueUseCase,
});

container.register("GetActiveMenuUseCase", {
  useClass: GetActiveMenuUseCase,
});

container.register("CreateMenuUseCase", {
  useClass: CreateMenuUseCase,
});

container.register("SubscribeToPushNotificationsUseCase", {
  useClass: SubscribeToPushNotificationsUseCase,
});

container.register("UnsubscribeFromPushNotificationsUseCase", {
  useClass: UnsubscribeFromPushNotificationsUseCase,
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

container.register("WebhookController", {
  useClass: WebhookController,
});

// Register WebSocket manager
container.register("WebSocketManager", {
  useClass: WebSocketManager,
});

logger.info("Database connection initialized");

export { container };
