import { Router, type Request, type Response } from "express";

export const testRouter = Router();

// Sentry verification endpoint
testRouter.get("/debug-sentry", (_req: Request, _res: Response) => {
  throw new Error("My first Sentry error!");
});

// Additional test endpoints for development
if (process.env.NODE_ENV === "development") {
  testRouter.post("/error", (_req: Request, _res: Response) => {
    throw new Error("Test error from POST /test/error");
  });

  testRouter.post("/critical", (_req: Request, _res: Response) => {
    throw new Error("Test critical error");
  });
}

