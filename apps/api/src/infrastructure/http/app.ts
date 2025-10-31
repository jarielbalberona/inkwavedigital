import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import * as Sentry from "@sentry/node";
import { healthRouter } from "./routes/health.routes.js";
import { ordersRouter } from "./routes/orders.routes.js";
import { menuRouter } from "./routes/menu.routes.js";
import { venuesRouter } from "./routes/venues.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { imagesRouter } from "./routes/images.routes.js";
import { webhookRouter } from "./routes/webhook.routes.js";
import { testRouter } from "./routes/test.routes.js";
import pushRouter from "./routes/push.routes.js";
import { errorHandler } from "../../interfaces/middlewares/error-handler.middleware.js";
import { performanceMiddleware } from "../../interfaces/middlewares/performance.middleware.js";

export const app: Application = express();

// Performance monitoring
app.use(performanceMiddleware);

// Security middleware
app.use(helmet());

// CORS
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : ["http://localhost:5173", "http://localhost:5174"];

// Log CORS origins in development for debugging
if (process.env.NODE_ENV !== "production") {
  console.log("CORS Origins configured:", corsOrigins);
}

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

// Webhook routes MUST come before body parsing middleware
// Webhooks need raw body for signature verification
app.use("/api/v1/webhooks", webhookRouter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/health", healthRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/menu", menuRouter);
app.use("/api/v1/venues", venuesRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/images", imagesRouter);
app.use("/api/v1/push", pushRouter);

// Test endpoints - only available in development and staging
if (process.env.NODE_ENV !== "production") {
  app.use("/api/v1/test", testRouter);
}

// Sentry error handler must be before custom error handler but after all routes
Sentry.setupExpressErrorHandler(app);

// Error handling (must be last)
app.use(errorHandler);

