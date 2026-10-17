import 'dotenv/config';
import { pool } from '../database';
import { toCamelMany } from '../utils/case';
import { RecurringTransaction, CreateRecurringTransactionInput, UpdateRecurringTransactionInput } from '../types/RecurringTransaction';

export class RecurringTransactionRepository {

    async createRecurringTransacion(data: CreateRecurringTransactionInput): Promise<number> {
        const { rows } = await pool.query(`
            INSERT INTO recurring_transactions
            (type, name, amount, start_date, due_date, workspace_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
            `, [data.type, data.name, data.amount, data.startDate, data.dueDate ?? null, data.workspaceId]
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

    async updateRecurringTransaction(data: UpdateRecurringTransactionInput): Promise<void> {
        await pool.query(`
            UPDATE recurring_transactions 
            SET name = $1, amount = $2, due_date = $3
            WHERE id = $4
            `, [data.name, data.amount, data.dueDate ?? null, data.id]
        );
    }
}