import 'dotenv/config';
import { pool } from '../database';
import { toCamel, toCamelMany } from '../utils/case';
import { Expense, UpdateExpenseRequest, ExpenseItem, CreateExpenseRequest } from '../types/Expense';

export class ExpenseRepository {

    async getExpenses(month: string, workspaceId: number): Promise<ExpenseItem[]> {   
        const { rows } = await pool.query(`
            SELECT e.*, w.name as wallet_name
            FROM expenses e
            LEFT JOIN wallets w ON e.wallet_id = w.id
            WHERE e.workspace_id = $1
            AND COALESCE(e.date, e.due_date, e.created_at::date, now()::date) >= $2::date
            AND COALESCE(e.date, e.due_date, e.created_at::date, now()::date) < ($2::date + INTERVAL '1 month')
            ORDER BY e.paid, e.id DESC
            `, [workspaceId, month + '-01']
        );
        return toCamelMany(rows);
    }

    async getExpenseById(id: number, workspaceId?: number): Promise<Expense | undefined> {
        let query = `SELECT * FROM expenses WHERE id = $1`;
        const params: any[] = [id];

        if (workspaceId !== undefined) {
            query += ` AND workspace_id = $2`;
            params.push(workspaceId);
        }

        const { rows } = await pool.query(query, params);
        return toCamel(rows[0]);
    }

    async createExpense(data: CreateExpenseRequest): Promise<Expense> {
        const { rows } = await pool.query(`
            INSERT INTO expenses
            (name, amount, date, due_date, wallet_id, recurring_transaction_id, paid, workspace_id, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
            `, [
                data.name, 
                data.amount, 
                data.date || null, 
                data.dueDate || null, 
                data.walletId || null, 
                data.recurringTransactionId || null, 
                data.paid ?? true,
                data.workspaceId,
                data.createdBy ?? null
            ]
        );
        return toCamel(rows[0]);
    }

    async updateExpense(data: UpdateExpenseRequest): Promise<Expense> {
        const { rows } = await pool.query(`
            UPDATE expenses
            SET name = $1, amount = $2, date = $3, due_date = $4, wallet_id = $5
            WHERE id = $6
            RETURNING *
            `, [data.name, data.amount, data.date || null, data.dueDate || null, data.walletId || null, data.id]
        );
        return toCamel(rows[0]);
    }

    async deleteExpense(id: number): Promise<Expense> {
        const { rows } = await pool.query(`
            UPDATE expenses
            SET deleted_at = now()
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING *
            `, [id]
        );
        return toCamel(rows[0]);
    }

    async updatePaidStatus(id: number, paid: boolean, wallet_id?: number | null, date?: string | null): Promise<Expense> {
        if (date !== undefined) {
            const { rows } = await pool.query(`
                UPDATE expenses
                SET paid = $1, wallet_id = $2, date = $3
                WHERE id = $4
                RETURNING *
                `, [paid, wallet_id ?? null, date || null, id]
            );
            return toCamel(rows[0]);
        }
        const { rows } = await pool.query(`
            UPDATE expenses
            SET paid = $1, wallet_id = $2
            WHERE id = $3
            RETURNING *
            `, [paid, wallet_id ?? null, id]
        );
        return toCamel(rows[0]);
    }
}