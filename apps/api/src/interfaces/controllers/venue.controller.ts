import { injectable, inject } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { GetVenueTablesUseCase } from "../../application/use-cases/GetVenueTablesUseCase.js";

@injectable()
export class VenueController {
  constructor(
    @inject(GetVenueTablesUseCase) private getVenueTablesUseCase: GetVenueTablesUseCase
  ) {}

  async getTables(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { venueId } = req.params;

      const result = await this.getVenueTablesUseCase.execute({
        venueId,
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
