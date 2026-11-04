import { CategoryRepository } from "../repository/category.repository";
import { CreateCategoryRequest, UpdateCategoryRequest, Category, CategoriesResponse } from "../types/Category";

export class CategoryService {
    constructor(private categoryRepository: CategoryRepository) {}

    async getCategories(workspaceId: number): Promise<CategoriesResponse> {
        const categories = await this.categoryRepository.getCategories(workspaceId);
        return { categories, total: categories.length };
    }

    async createCategory(data: CreateCategoryRequest): Promise<Category> {
        return await this.categoryRepository.createCategory(data);
    }

    async updateCategory(data: UpdateCategoryRequest, workspaceId: number): Promise<Category> {
        return await this.categoryRepository.updateCategory(data, workspaceId);
    }

    async deleteCategory(id: number, workspaceId: number): Promise<Category> {
        return await this.categoryRepository.deleteCategory(id, workspaceId);
    }
}
