import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { createCategorySchema, updateCategorySchema } from "../types/Category";
import { idParamSchema } from "../types/Params";

export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    getCategories = async (req: Request, res: Response): Promise<Response> => {
        const workspaceId = req.workspaceId!;
        const result = await this.categoryService.getCategories(workspaceId);
        return res.status(200).json(result);
    }

    createCategory = async (req: Request, res: Response): Promise<Response> => {
        const workspaceId = req.workspaceId!;
        const parsed = createCategorySchema.safeParse({ ...req.body, workspaceId });
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const createdCategory = await this.categoryService.createCategory(parsed.data);
        return res.status(201).json(createdCategory);
    }

    updateCategory = async (req: Request, res: Response): Promise<Response> => {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ errors: parsedParams.error.flatten() });
        }
        const workspaceId = req.workspaceId!;
        const parsed = updateCategorySchema.safeParse({ id: parsedParams.data.id, ...req.body });
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const updated = await this.categoryService.updateCategory(parsed.data, workspaceId);
        return res.status(200).json(updated);
    }

    deleteCategory = async (req: Request, res: Response): Promise<Response> => {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ errors: parsedParams.error.flatten() });
        }
        const workspaceId = req.workspaceId!;
        const deleted = await this.categoryService.deleteCategory(parsedParams.data.id, workspaceId);
        return res.status(200).json(deleted);
    }
}
