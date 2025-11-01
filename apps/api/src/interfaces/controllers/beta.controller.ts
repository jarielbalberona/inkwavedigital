import { injectable, inject } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { createLogger } from "@inkwave/utils";
import { CreateBetaSignupUseCase } from "../../application/use-cases/CreateBetaSignupUseCase.js";
import { ValidationError, DomainError } from "../../shared/errors/domain-error.js";

const logger = createLogger("beta-controller");

@injectable()
export class BetaController {
  constructor(
    @inject(CreateBetaSignupUseCase) private createBetaSignupUseCase: CreateBetaSignupUseCase
  ) {}

  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, establishmentName } = req.body;

      if (!email || !establishmentName) {
        return void res.status(400).json({
          success: false,
          error: "Email and establishment name are required",
        });
      }

      const result = await this.createBetaSignupUseCase.execute({
        email,
        establishmentName,
      });

      logger.info({ email: result.email, signupId: result.id }, "Beta signup successful");

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DomainError) {
        return next(error);
      }

      logger.error({ error: error instanceof Error ? error.message : String(error) }, "Beta signup failed");
      next(error);
    }
  }
}

