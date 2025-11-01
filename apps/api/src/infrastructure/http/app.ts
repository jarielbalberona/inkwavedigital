import express, { type Application } from "express";
import cors, { type CorsOptions } from "cors";
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
const allowed = new Set([
  "https://dumadine.com",
  "https://www.dumadine.com",
  "https://dashboard.dumadine.com",
  "https://www.dashboard.dumadine.com",
  "https://admin.dumadine.com",
  "https://www.admin.dumadine.com",
]);

const corsOptions: CorsOptions = {
  origin(origin, cb) {
    // allow curl/postman/no-origin and same-origin SSR
    if (!origin) return cb(null, true);
    if (allowed.has(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-tenant-id"],
  exposedHeaders: ["Content-Length"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// IMPORTANT: explicitly handle preflight for all routes
app.options("*", cors(corsOptions));
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

