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

export class RecurringTransactionRepository {

    async createRecurringTransacion(data: CreateRecurringTransactionInput): Promise<number> {
        const { rows } = await pool.query(`
            INSERT INTO recurring_transactions
            (type, name, amount, start_date, due_date, workspace_id, category_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
            `, [data.type, data.name, data.amount, data.startDate, data.dueDate ?? null, data.workspaceId, data.categoryId ?? null]
        );
        return rows[0].id;
    }

    async getRecurringTransactionByDate(date: string, type: string, workspaceId: number): Promise<RecurringTransaction[]> {
        const { rows } = await pool.query(`
            SELECT * FROM recurring_transactions
            WHERE start_date <= $1 AND type = $2 AND workspace_id = $3
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
        `;
        const params: any[] = [workspaceId];

        if (type) {
            query += ` AND rt.type = $2`;
            params.push(type);
        }

        query += ` ORDER BY rt.type ASC, rt.due_date ASC, rt.id DESC`;

        const { rows } = await pool.query(query, params);
        return rows.map((row) => ({
            id: row.id,
            type: row.type,
            name: row.name,
            amount: Number(row.amount),
            startDate: formatDateOnly(row.start_date),
            dueDate: formatDateOnly(row.due_date),
            workspaceId: row.workspace_id,
            categoryId: row.category_id,
            categoryName: row.category_name || null,
        }));
    }

    async updateRecurringTransaction(data: UpdateRecurringTransactionInput): Promise<void> {
        await pool.query(`
            UPDATE recurring_transactions 
            SET name = $1, amount = $2, due_date = $3
            WHERE id = $4
            `, [data.name, data.amount, data.dueDate ?? null, data.id]
        );
    }
}
