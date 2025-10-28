import { injectable, inject } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { GetVenueTablesUseCase } from "../../application/use-cases/GetVenueTablesUseCase.js";
import { GetVenueInfoUseCase } from "../../application/use-cases/GetVenueInfoUseCase.js";
import { GetVenuesUseCase } from "../../application/use-cases/GetVenuesUseCase.js";
import { GetVenueBySlugUseCase } from "../../application/use-cases/GetVenueBySlugUseCase.js";
import { CreateVenueUseCase } from "../../application/use-cases/CreateVenueUseCase.js";
import { UpdateVenueUseCase } from "../../application/use-cases/UpdateVenueUseCase.js";
import { DeleteVenueUseCase } from "../../application/use-cases/DeleteVenueUseCase.js";
import { CreateTableUseCase } from "../../application/use-cases/CreateTableUseCase.js";
import { UpdateTableUseCase } from "../../application/use-cases/UpdateTableUseCase.js";
import { DeleteTableUseCase } from "../../application/use-cases/DeleteTableUseCase.js";
import { ValidationError } from "../../shared/errors/domain-error.js";

@injectable()
export class VenueController {
  constructor(
    @inject(GetVenueTablesUseCase) private getVenueTablesUseCase: GetVenueTablesUseCase,
    @inject(GetVenueInfoUseCase) private getVenueInfoUseCase: GetVenueInfoUseCase,
    @inject(GetVenuesUseCase) private getVenuesUseCase: GetVenuesUseCase,
    @inject(GetVenueBySlugUseCase) private getVenueBySlugUseCase: GetVenueBySlugUseCase,
    @inject(CreateVenueUseCase) private createVenueUseCase: CreateVenueUseCase,
    @inject(UpdateVenueUseCase) private updateVenueUseCase: UpdateVenueUseCase,
    @inject(DeleteVenueUseCase) private deleteVenueUseCase: DeleteVenueUseCase,
    @inject(CreateTableUseCase) private createTableUseCase: CreateTableUseCase,
    @inject(UpdateTableUseCase) private updateTableUseCase: UpdateTableUseCase,
    @inject(DeleteTableUseCase) private deleteTableUseCase: DeleteTableUseCase
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

  async getVenueBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantSlug, venueSlug } = req.params;

      const result = await this.getVenueBySlugUseCase.execute({
        tenantSlug,
        venueSlug,
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

  async createTable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { venueId } = req.params;
      const { tableNumber, name, label, description, capacity } = req.body;

      if (!label) {
        throw new ValidationError("Table label is required");
      }

      const result = await this.createTableUseCase.execute({
        venueId,
        tableNumber,
        name,
        label,
        description,
        capacity,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tableId } = req.params;
      const { tableNumber, name, label, description, capacity, isActive } = req.body;

      const result = await this.updateTableUseCase.execute({
        id: tableId,
        tableNumber,
        name,
        label,
        description,
        capacity,
        isActive,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tableId } = req.params;

      await this.deleteTableUseCase.execute({ id: tableId });

      res.json({
        success: true,
        message: "Table deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
