import { injectable, inject } from "tsyringe";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository.js";
import { NotFoundError } from "../../shared/errors/domain-error.js";
import type { Logger } from "@inkwave/utils";

export interface UpdateOrderStaffNotesInput {
  orderId: string;
  staffNotes: string;
}

export interface UpdateOrderStaffNotesOutput {
  orderId: string;
  staffNotes: string;
  updatedAt: string;
}

@injectable()
export class UpdateOrderStaffNotesUseCase {
  constructor(
    @inject("IOrderRepository") private orderRepository: IOrderRepository,
    @inject("Logger") private logger: Logger
  ) {}

  async execute(input: UpdateOrderStaffNotesInput): Promise<UpdateOrderStaffNotesOutput> {
    this.logger.info({ orderId: input.orderId }, "Updating order staff notes");

    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundError("Order");
    }

    order.updateStaffNotes(input.staffNotes);
    await this.orderRepository.save(order);

    this.logger.info({ orderId: input.orderId }, "Order staff notes updated successfully");

    return {
      orderId: order.id,
      staffNotes: order.staffNotes || "",
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}

