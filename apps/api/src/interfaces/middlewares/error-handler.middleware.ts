import type { Request, Response, NextFunction } from "express";
import { createLogger } from "@inkwave/utils";
import {
  DomainError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "../../shared/errors/domain-error.js";

const logger = createLogger("error-handler");

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error
  logger.error({ err, name: err.name, message: err.message }, "Error occurred");

  // Handle domain errors
  if (err instanceof NotFoundError) {
    return void res.status(404).json({
      success: false,
      error: err.message,
    });
  }

  if (err instanceof ValidationError) {
    return void res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  if (err instanceof UnauthorizedError) {
    return void res.status(401).json({
      success: false,
      error: err.message,
    });
  }

  if (err instanceof DomainError) {
    return void res.status(422).json({
      success: false,
      error: err.message,
    });
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
}

