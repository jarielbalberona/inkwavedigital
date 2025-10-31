import { injectable, inject } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { CreateOrderUseCase } from "../../application/use-cases/CreateOrderUseCase.js";
import { UpdateOrderStatusUseCase } from "../../application/use-cases/UpdateOrderStatusUseCase.js";
import { UpdateOrderStaffNotesUseCase } from "../../application/use-cases/UpdateOrderStaffNotesUseCase.js";
import { GetVenueOrdersUseCase } from "../../application/use-cases/GetVenueOrdersUseCase.js";
import { GetDeviceOrdersUseCase } from "../../application/use-cases/GetDeviceOrdersUseCase.js";
import { ValidationError } from "../../shared/errors/domain-error.js";

@injectable()
export class OrderController {
  constructor(
    @inject(CreateOrderUseCase) private createOrderUseCase: CreateOrderUseCase,
    @inject(UpdateOrderStatusUseCase) private updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    @inject(UpdateOrderStaffNotesUseCase) private updateOrderStaffNotesUseCase: UpdateOrderStaffNotesUseCase,
    @inject(GetVenueOrdersUseCase) private getVenueOrdersUseCase: GetVenueOrdersUseCase,
    @inject(GetDeviceOrdersUseCase) private getDeviceOrdersUseCase: GetDeviceOrdersUseCase
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { venueId, tableId, deviceId, pax, notes, items } = req.body;

      if (!venueId || !items || !Array.isArray(items) || items.length === 0) {
        throw new ValidationError("Invalid order data");
      }

      const result = await this.createOrderUseCase.execute({
        venueId,
        tableId,
        deviceId,
        pax,
        notes,
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
      const { status, cancellationReason } = req.body;

      if (!status) {
        throw new ValidationError("Status is required");
      }

      const result = await this.updateOrderStatusUseCase.execute({
        orderId: id,
        newStatus: status,
        cancellationReason,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStaffNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { staffNotes } = req.body;

      if (staffNotes === undefined) {
        throw new ValidationError("Staff notes is required");
      }

      const result = await this.updateOrderStaffNotesUseCase.execute({
        orderId: id,
        staffNotes,
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
      const { status, limit, offset, dateFrom, dateTo } = req.query;

      const result = await this.getVenueOrdersUseCase.execute({
        venueId,
        status: status as string | undefined,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
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

  async getDeviceOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { deviceId } = req.params;
      const { venueId } = req.query;

      if (!deviceId) {
        throw new ValidationError("Device ID is required");
      }

      const result = await this.getDeviceOrdersUseCase.execute({
        deviceId,
        venueId: venueId as string | undefined,
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

