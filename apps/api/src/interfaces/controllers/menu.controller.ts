import { injectable, inject } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { GetMenuUseCase } from "../../application/use-cases/GetMenuUseCase.js";
import { GetCategoriesUseCase } from "../../application/use-cases/GetCategoriesUseCase.js";
import { CreateCategoryUseCase } from "../../application/use-cases/CreateCategoryUseCase.js";
import { UpdateCategoryUseCase } from "../../application/use-cases/UpdateCategoryUseCase.js";
import { DeleteCategoryUseCase } from "../../application/use-cases/DeleteCategoryUseCase.js";
import { CreateMenuItemUseCase } from "../../application/use-cases/CreateMenuItemUseCase.js";
import { GetCategoryItemsUseCase } from "../../application/use-cases/GetCategoryItemsUseCase.js";

@injectable()
export class MenuController {
  constructor(
    @inject(GetMenuUseCase) private getMenuUseCase: GetMenuUseCase,
    @inject(GetCategoriesUseCase) private getCategoriesUseCase: GetCategoriesUseCase,
    @inject(CreateCategoryUseCase) private createCategoryUseCase: CreateCategoryUseCase,
    @inject(UpdateCategoryUseCase) private updateCategoryUseCase: UpdateCategoryUseCase,
    @inject(DeleteCategoryUseCase) private deleteCategoryUseCase: DeleteCategoryUseCase,
    @inject(CreateMenuItemUseCase) private createMenuItemUseCase: CreateMenuItemUseCase,
    @inject(GetCategoryItemsUseCase) private getCategoryItemsUseCase: GetCategoryItemsUseCase
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
}