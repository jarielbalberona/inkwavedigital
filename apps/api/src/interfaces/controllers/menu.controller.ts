import { injectable, inject } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { GetMenuUseCase } from "../../application/use-cases/GetMenuUseCase.js";

@injectable()
export class MenuController {
  constructor(@inject(GetMenuUseCase) private getMenuUseCase: GetMenuUseCase) {}

  async getMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { venueId } = req.params;
      const { availableOnly } = req.query;

      const result = await this.getMenuUseCase.execute({
        venueId,
        availableOnly: availableOnly === "true",
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

