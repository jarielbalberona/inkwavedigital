import { injectable } from "tsyringe";
import type { Request, Response } from "express";
import type { HealthCheckResponse } from "@inkwave/types";

@injectable()
export class HealthController {
  async check(_req: Request, res: Response): Promise<void> {
    const response: HealthCheckResponse = {
      status: "ok",
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  }
}

