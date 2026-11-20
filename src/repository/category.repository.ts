import { CreateCategoryRequest, UpdateCategoryRequest, Category } from "../types/Category";
import { pool } from "../database";
import { toCamel, toCamelMany } from "../utils/case";

export class CategoryRepository {

    async getCategories(workspaceId: number): Promise<Category[]> {
        const { rows } = await pool.query(`
            SELECT *
            FROM categories
            WHERE workspace_id = $1 AND deleted_at IS NULL
            ORDER BY name ASC
            `, [workspaceId]
        );
        return toCamelMany(rows).map(normalizeCategory);
    }

    async getCategoryById(id: number, workspaceId: number): Promise<Category | undefined> {
        const { rows } = await pool.query(`
            SELECT *
            FROM categories
            WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL
            `, [id, workspaceId]
        );
        return rows[0] ? normalizeCategory(toCamel(rows[0])) : undefined;
    }

    async createCategory(data: CreateCategoryRequest): Promise<Category> {
        const { rows } = await pool.query(`
            INSERT INTO categories
            (name, workspace_id, estimated_amount)
            VALUES ($1, $2, $3)
            RETURNING *
            `, [
                data.name,
                data.workspaceId,
                data.estimatedAmount || null,
            ]
        );
        return normalizeCategory(toCamel(rows[0]));
    }

    async updateCategory(data: UpdateCategoryRequest, workspaceId: number): Promise<Category> {
        const { rows } = await pool.query(`
            UPDATE categories
            SET name = $1, estimated_amount = $2
            WHERE id = $3 AND workspace_id = $4 AND deleted_at IS NULL
            RETURNING *
            `, [
                data.name,
                data.estimatedAmount || null,
                data.id,
                workspaceId,
            ]
        );
        return normalizeCategory(toCamel(rows[0]));
    }

    async deleteCategory(id: number, workspaceId: number): Promise<Category> {
        const { rows } = await pool.query(`
            UPDATE categories
            SET deleted_at = now()
            WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL
            RETURNING *
            `, [id, workspaceId]
        );
        return normalizeCategory(toCamel(rows[0]));
    }
}

function normalizeCategory(row: Category): Category {
    return {
        ...row,
        estimatedAmount: row.estimatedAmount == null ? null : Number(row.estimatedAmount),
    };
}
