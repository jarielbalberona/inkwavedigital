import { injectable, inject } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { CreateTenantUseCase } from "../../application/use-cases/admin/CreateTenantUseCase.js";
import { UpdateTenantSettingsUseCase } from "../../application/use-cases/admin/UpdateTenantSettingsUseCase.js";
import { GetTenantSettingsUseCase } from "../../application/use-cases/admin/GetTenantSettingsUseCase.js";
import type { ITenantRepository } from "../../domain/repositories/ITenantRepository.js";

@injectable()
export class AdminController {
  constructor(
    @inject(CreateTenantUseCase) private createTenantUseCase: CreateTenantUseCase,
    @inject(UpdateTenantSettingsUseCase) private updateTenantSettingsUseCase: UpdateTenantSettingsUseCase,
    @inject(GetTenantSettingsUseCase) private getTenantSettingsUseCase: GetTenantSettingsUseCase,
    @inject("ITenantRepository") private tenantRepository: ITenantRepository
  ) {}

  async createTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, slug, ownerEmail, settings, initialVenue } = req.body;

      const result = await this.createTenantUseCase.execute({
        name,
        slug,
        ownerEmail,
        settings,
        initialVenue,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTenants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenants = await this.tenantRepository.findAll();

      res.json({
        success: true,
        data: tenants.map((t) => t.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  }

  async getTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const tenant = await this.tenantRepository.findById(id);
      if (!tenant) {
        return void res.status(404).json({
          success: false,
          error: "Tenant not found",
        });
      }

      res.json({
        success: true,
        data: tenant.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await this.tenantRepository.delete(id);

      res.json({
        success: true,
        message: "Tenant deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getTenantSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const result = await this.getTenantSettingsUseCase.execute({
        tenantId: id,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTenantSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { settings } = req.body;

      const result = await this.updateTenantSettingsUseCase.execute({
        tenantId: id,
        settings,
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

