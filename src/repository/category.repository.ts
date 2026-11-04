import 'dotenv/config';
import { pool } from '../database';
import { toCamel, toCamelMany } from '../utils/case';
import { CreateCategoryRequest, UpdateCategoryRequest, Category } from '../types/Category';

export class CategoryRepository {

    async getCategories(workspaceId: number): Promise<Category[]> {
        const { rows } = await pool.query(`
            SELECT *
            FROM categories
            WHERE workspace_id = $1 AND deleted_at IS NULL
            ORDER BY name ASC
            `, [workspaceId]
        );
        return toCamelMany(rows);
    }

    async getCategoryById(id: number, workspaceId: number): Promise<Category | undefined> {
        const { rows } = await pool.query(`
            SELECT *
            FROM categories
            WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL
            `, [id, workspaceId]
        );
        return toCamel(rows[0]);
    }

    async createCategory(data: CreateCategoryRequest): Promise<Category> {
        const { rows } = await pool.query(`
            INSERT INTO categories
            (name, workspace_id)
            VALUES ($1, $2)
            RETURNING *
            `, [data.name, data.workspaceId]
        );
        return toCamel(rows[0]);
    }

    async updateCategory(data: UpdateCategoryRequest, workspaceId: number): Promise<Category> {
        const { rows } = await pool.query(`
            UPDATE categories
            SET name = $1
            WHERE id = $2 AND workspace_id = $3 AND deleted_at IS NULL
            RETURNING *
            `, [data.name, data.id, workspaceId]
        );
        return toCamel(rows[0]);
    }

    async deleteCategory(id: number, workspaceId: number): Promise<Category> {
        const { rows } = await pool.query(`
            UPDATE categories
            SET deleted_at = now()
            WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL
            RETURNING *
            `, [id, workspaceId]
        );
        return toCamel(rows[0]);
    }
}
