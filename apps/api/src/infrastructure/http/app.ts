import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health.routes.js";
import { ordersRouter } from "./routes/orders.routes.js";
import { menuRouter } from "./routes/menu.routes.js";
import { venuesRouter } from "./routes/venues.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { imagesRouter } from "./routes/images.routes.js";
import { errorHandler } from "../../interfaces/middlewares/error-handler.middleware.js";

export const app: Application = express();

// Security middleware
app.use(helmet());

// CORS
const corsOrigins = process.env.CORS_ORIGINS?.split(",") || ["http://localhost:5173", "http://localhost:5174"];
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

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

// Error handling (must be last)
app.use(errorHandler);

