import { injectable, inject } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { GetVenueTablesUseCase } from "../../application/use-cases/GetVenueTablesUseCase.js";
import { GetVenueInfoUseCase } from "../../application/use-cases/GetVenueInfoUseCase.js";
import { GetVenuesUseCase } from "../../application/use-cases/GetVenuesUseCase.js";
import { CreateVenueUseCase } from "../../application/use-cases/CreateVenueUseCase.js";
import { UpdateVenueUseCase } from "../../application/use-cases/UpdateVenueUseCase.js";
import { DeleteVenueUseCase } from "../../application/use-cases/DeleteVenueUseCase.js";

@injectable()
export class VenueController {
  constructor(
    @inject(GetVenueTablesUseCase) private getVenueTablesUseCase: GetVenueTablesUseCase,
    @inject(GetVenueInfoUseCase) private getVenueInfoUseCase: GetVenueInfoUseCase,
    @inject(GetVenuesUseCase) private getVenuesUseCase: GetVenuesUseCase,
    @inject(CreateVenueUseCase) private createVenueUseCase: CreateVenueUseCase,
    @inject(UpdateVenueUseCase) private updateVenueUseCase: UpdateVenueUseCase,
    @inject(DeleteVenueUseCase) private deleteVenueUseCase: DeleteVenueUseCase
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

  async getVenues(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.headers["x-tenant-id"] as string;
      
      if (!tenantId) {
        return void res.status(400).json({
          success: false,
          error: "Tenant ID is required",
        });
      }

      const result = await this.getVenuesUseCase.execute({ tenantId });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createVenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.headers["x-tenant-id"] as string;
      const { name, slug, address, timezone } = req.body;

      if (!tenantId) {
        return void res.status(400).json({
          success: false,
          error: "Tenant ID is required",
        });
      }

      if (!name || !slug) {
        return void res.status(400).json({
          success: false,
          error: "Name and slug are required",
        });
      }

      const result = await this.createVenueUseCase.execute({
        tenantId,
        name,
        slug,
        address,
        timezone,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateVenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { venueId } = req.params;
      const { name, address, timezone } = req.body;

      const result = await this.updateVenueUseCase.execute({
        venueId,
        name,
        address,
        timezone,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteVenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { venueId } = req.params;

      await this.deleteVenueUseCase.execute({ venueId });

      res.json({
        success: true,
        message: "Venue deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
