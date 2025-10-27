import { injectable, inject } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { GetVenueTablesUseCase } from "../../application/use-cases/GetVenueTablesUseCase.js";
import { GetVenueInfoUseCase } from "../../application/use-cases/GetVenueInfoUseCase.js";

@injectable()
export class VenueController {
  constructor(
    @inject(GetVenueTablesUseCase) private getVenueTablesUseCase: GetVenueTablesUseCase,
    @inject(GetVenueInfoUseCase) private getVenueInfoUseCase: GetVenueInfoUseCase
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

  async getVenueInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { venueId } = req.params;

      const result = await this.getVenueInfoUseCase.execute({
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
