import { injectable, inject } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { GetMenuUseCase } from "../../application/use-cases/GetMenuUseCase.js";
import { GetCategoriesUseCase } from "../../application/use-cases/GetCategoriesUseCase.js";
import { CreateCategoryUseCase } from "../../application/use-cases/CreateCategoryUseCase.js";
import { UpdateCategoryUseCase } from "../../application/use-cases/UpdateCategoryUseCase.js";
import { DeleteCategoryUseCase } from "../../application/use-cases/DeleteCategoryUseCase.js";
import { CreateMenuItemUseCase } from "../../application/use-cases/CreateMenuItemUseCase.js";
import { GetCategoryItemsUseCase } from "../../application/use-cases/GetCategoryItemsUseCase.js";
import { CreateItemOptionUseCase } from "../../application/use-cases/CreateItemOptionUseCase.js";
import { UpdateItemOptionUseCase } from "../../application/use-cases/UpdateItemOptionUseCase.js";
import { DeleteItemOptionUseCase } from "../../application/use-cases/DeleteItemOptionUseCase.js";
import { GetItemOptionsUseCase } from "../../application/use-cases/GetItemOptionsUseCase.js";
import { CreateItemOptionValueUseCase } from "../../application/use-cases/CreateItemOptionValueUseCase.js";
import { UpdateItemOptionValueUseCase } from "../../application/use-cases/UpdateItemOptionValueUseCase.js";
import { DeleteItemOptionValueUseCase } from "../../application/use-cases/DeleteItemOptionValueUseCase.js";

@injectable()
export class MenuController {
  constructor(
    @inject(GetMenuUseCase) private getMenuUseCase: GetMenuUseCase,
    @inject(GetCategoriesUseCase) private getCategoriesUseCase: GetCategoriesUseCase,
    @inject(CreateCategoryUseCase) private createCategoryUseCase: CreateCategoryUseCase,
    @inject(UpdateCategoryUseCase) private updateCategoryUseCase: UpdateCategoryUseCase,
    @inject(DeleteCategoryUseCase) private deleteCategoryUseCase: DeleteCategoryUseCase,
    @inject(CreateMenuItemUseCase) private createMenuItemUseCase: CreateMenuItemUseCase,
    @inject(GetCategoryItemsUseCase) private getCategoryItemsUseCase: GetCategoryItemsUseCase,
    @inject(CreateItemOptionUseCase) private createItemOptionUseCase: CreateItemOptionUseCase,
    @inject(UpdateItemOptionUseCase) private updateItemOptionUseCase: UpdateItemOptionUseCase,
    @inject(DeleteItemOptionUseCase) private deleteItemOptionUseCase: DeleteItemOptionUseCase,
    @inject(GetItemOptionsUseCase) private getItemOptionsUseCase: GetItemOptionsUseCase,
    @inject(CreateItemOptionValueUseCase) private createItemOptionValueUseCase: CreateItemOptionValueUseCase,
    @inject(UpdateItemOptionValueUseCase) private updateItemOptionValueUseCase: UpdateItemOptionValueUseCase,
    @inject(DeleteItemOptionValueUseCase) private deleteItemOptionValueUseCase: DeleteItemOptionValueUseCase
  ) {}

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

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { venueId } = req.params;

      const result = await this.getCategoriesUseCase.execute({
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

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { venueId } = req.params;
      const categoryData = req.body;

      const result = await this.createCategoryUseCase.execute({
        venueId,
        ...categoryData,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = req.params;
      const updateData = req.body;

      const result = await this.updateCategoryUseCase.execute({
        id: categoryId,
        ...updateData,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = req.params;

      await this.deleteCategoryUseCase.execute({
        id: categoryId,
      });

      res.json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async createMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const itemData = req.body;

      const result = await this.createMenuItemUseCase.execute(itemData);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = req.params;

      const result = await this.getCategoryItemsUseCase.execute({
        categoryId,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Item Options Management
  async getItemOptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { itemId } = req.params;

      const result = await this.getItemOptionsUseCase.execute({
        itemId,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createItemOption(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { itemId } = req.params;
      const optionData = req.body;

      const result = await this.createItemOptionUseCase.execute({
        itemId,
        ...optionData,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateItemOption(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { optionId } = req.params;
      const updateData = req.body;

      const result = await this.updateItemOptionUseCase.execute({
        id: optionId,
        ...updateData,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteItemOption(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { optionId } = req.params;

      await this.deleteItemOptionUseCase.execute({
        id: optionId,
      });

      res.json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async createOptionValue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { optionId } = req.params;
      const valueData = req.body;

      const result = await this.createItemOptionValueUseCase.execute({
        optionId,
        ...valueData,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOptionValue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { valueId } = req.params;
      const updateData = req.body;

      const result = await this.updateItemOptionValueUseCase.execute({
        id: valueId,
        ...updateData,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteOptionValue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { valueId } = req.params;

      await this.deleteItemOptionValueUseCase.execute({
        id: valueId,
      });

      res.json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}