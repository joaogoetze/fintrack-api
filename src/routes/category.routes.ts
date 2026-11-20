import { Router } from "express";
import { CategoryRepository } from "../repository/category.repository";
import { CategoryService } from "../services/category.service";
import { CategoryController } from "../controllers/category.controller";

export const categoryRoutes = Router();

const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

categoryRoutes.get("/", categoryController.getCategories);
categoryRoutes.post("/", categoryController.createCategory);
categoryRoutes.put("/:id", categoryController.updateCategory);
categoryRoutes.delete("/:id", categoryController.deleteCategory);
