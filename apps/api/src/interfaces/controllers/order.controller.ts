import { injectable, inject } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { CreateOrderUseCase } from "../../application/use-cases/CreateOrderUseCase.js";
import { UpdateOrderStatusUseCase } from "../../application/use-cases/UpdateOrderStatusUseCase.js";
import { GetVenueOrdersUseCase } from "../../application/use-cases/GetVenueOrdersUseCase.js";
import { ValidationError } from "../../shared/errors/domain-error.js";

@injectable()
export class OrderController {
  constructor(
    @inject(CreateOrderUseCase) private createOrderUseCase: CreateOrderUseCase,
    @inject(UpdateOrderStatusUseCase) private updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    @inject(GetVenueOrdersUseCase) private getVenueOrdersUseCase: GetVenueOrdersUseCase
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { venueId, tableId, deviceId, items } = req.body;

      if (!venueId || !items || !Array.isArray(items) || items.length === 0) {
        throw new ValidationError("Invalid order data");
      }

      const result = await this.createOrderUseCase.execute({
        venueId,
        tableId,
        deviceId,
        items,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new ValidationError("Status is required");
      }

      const result = await this.updateOrderStatusUseCase.execute({
        orderId: id,
        newStatus: status,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVenueOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { venueId } = req.params;
      const { status, limit, offset } = req.query;

      const result = await this.getVenueOrdersUseCase.execute({
        venueId,
        status: status as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
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

