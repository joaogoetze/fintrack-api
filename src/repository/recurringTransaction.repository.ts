import 'dotenv/config';
import { pool } from '../database';
import { toCamelMany } from '../utils/case';
import { formatDateOnly } from '../utils/dates';
import {
    RecurringTransaction,
    RecurringTransactionItem,
    CreateRecurringTransactionInput,
    UpdateRecurringTransactionInput
} from '../types/RecurringTransaction';

function mapItem(row: Record<string, any>): RecurringTransactionItem {
    return {
        id: row.id,
        type: row.type,
        name: row.name,
        amount: Number(row.amount),
        startDate: formatDateOnly(row.start_date ?? row.startDate),
        dueDate: formatDateOnly(row.due_date ?? row.dueDate),
        workspaceId: row.workspace_id ?? row.workspaceId,
        categoryId: row.category_id ?? row.categoryId ?? null,
        categoryName: row.category_name ?? row.categoryName ?? null,
    };
}

export class RecurringTransactionRepository {

    async createRecurringTransacion(data: CreateRecurringTransactionInput): Promise<RecurringTransactionItem> {
        const { rows } = await pool.query(`
            INSERT INTO recurring_transactions
            (type, name, amount, start_date, due_date, workspace_id, category_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
            `, [data.type, data.name, data.amount, data.startDate, data.dueDate ?? null, data.workspaceId, data.categoryId ?? null]
        );
        return mapItem(rows[0]);
    }

    async getRecurringTransactionByDate(date: string, type: string, workspaceId: number): Promise<RecurringTransaction[]> {
        const { rows } = await pool.query(`
            SELECT * FROM recurring_transactions
            WHERE start_date <= $1 AND type = $2 AND workspace_id = $3
            AND deleted_at IS NULL
            ORDER BY id ASC
            `, [date + '-01', type, workspaceId]
        );
        return toCamelMany(rows);
    }

    async getRecurringTransactions(workspaceId: number, type?: string): Promise<RecurringTransactionItem[]> {
        let query = `
            SELECT rt.*, c.name as category_name
            FROM recurring_transactions rt
            LEFT JOIN categories c ON rt.category_id = c.id
            WHERE rt.workspace_id = $1
            AND rt.deleted_at IS NULL
        `;
        const params: any[] = [workspaceId];

        if (type) {
            query += ` AND rt.type = $2`;
            params.push(type);
        }

        query += ` ORDER BY rt.type ASC, rt.due_date ASC, rt.id DESC`;

        const { rows } = await pool.query(query, params);
        return rows.map(mapItem);
    }

    async updateRecurringTransaction(data: UpdateRecurringTransactionInput, workspaceId: number): Promise<RecurringTransactionItem | undefined> {
        const { rows } = await pool.query(`
            UPDATE recurring_transactions 
            SET name = $1, amount = $2, due_date = $3, category_id = $4, start_date = COALESCE($5, start_date)
            WHERE id = $6 AND workspace_id = $7 AND deleted_at IS NULL
            RETURNING *
            `, [
                data.name,
                data.amount,
                data.dueDate ?? null,
                data.categoryId ?? null,
                data.startDate ?? null,
                data.id,
                workspaceId,
            ]
        );
        return rows[0] ? mapItem(rows[0]) : undefined;
    }

    async deleteRecurringTransaction(id: number, workspaceId: number): Promise<RecurringTransactionItem | undefined> {
        const { rows } = await pool.query(`
            UPDATE recurring_transactions
            SET deleted_at = now()
            WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL
            RETURNING *
            `, [id, workspaceId]
        );
        return rows[0] ? mapItem(rows[0]) : undefined;
    }
}
