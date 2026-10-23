import 'dotenv/config';
import { pool } from '../database';
import { toCamel, toCamelMany } from '../utils/case';
import { Income, UpdateIncomeRequest, IncomeItem, CreateIncomeRequest } from '../types/Income';

export class IncomeRepository {

    async getIncomes(month: string, workspaceId: number): Promise<IncomeItem[]> {
        const { rows } = await pool.query(`
            SELECT i.*, w.name as wallet_name
            FROM incomes i
            LEFT JOIN wallets w ON i.wallet_id = w.id
            WHERE i.workspace_id = $1
            AND COALESCE(i.date, i.due_date, i.created_at::date, now()::date) >= $2::date
            AND COALESCE(i.date, i.due_date, i.created_at::date, now()::date) < ($2::date + INTERVAL '1 month')
            ORDER BY i.paid, i.date DESC
            `, [workspaceId, month + '-01']
        );
        return toCamelMany(rows);
    }

    async getIncomeById(id: number, workspaceId?: number): Promise<Income | undefined> {
        let query = `SELECT * FROM incomes WHERE id = $1`;
        const params: any[] = [id];

        if (workspaceId !== undefined) {
            query += ` AND workspace_id = $2`;
            params.push(workspaceId);
        }

        const { rows } = await pool.query(query, params);
        return toCamel(rows[0]);
    }

    async createIncome(data: CreateIncomeRequest): Promise<Income> {
        const { rows } = await pool.query(`
            INSERT INTO incomes
            (name, amount, date, due_date, wallet_id, recurring_transaction_id, paid, workspace_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
            `, [
                data.name, 
                data.amount, 
                data.date || null, 
                data.dueDate || null, 
                data.walletId || null, 
                data.recurringTransactionId || null, 
                data.paid ?? true,
                data.workspaceId
            ]
        );
        return toCamel(rows[0]);
    }

    async updateIncome(data: UpdateIncomeRequest): Promise<Income> {
        const { rows } = await pool.query(`
            UPDATE incomes
            SET name = $1, amount = $2, date = $3, due_date = $4, wallet_id = $5, paid = $6
            WHERE id = $7
            RETURNING *
            `, [data.name, data.amount, data.date || null, data.dueDate || null, data.walletId || null, data.paid ?? false, data.id]
        );
        return toCamel(rows[0]);
    }

    async deleteIncome(id: number): Promise<Income> {
        const { rows } = await pool.query(`
            UPDATE incomes
            SET deleted_at = now()
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING *
            `, [id]
        );
        return toCamel(rows[0]);
    }

    async updatePaidStatus(id: number, paid: boolean, wallet_id?: number | null, date?: string | null): Promise<Income> {
        if (date !== undefined) {
            const { rows } = await pool.query(`
                UPDATE incomes
                SET paid = $1, wallet_id = $2, date = $3
                WHERE id = $4
                RETURNING *
                `, [paid, wallet_id ?? null, date || null, id]
            );
            return toCamel(rows[0]);
        }
        const { rows } = await pool.query(`
            UPDATE incomes
            SET paid = $1, wallet_id = $2
            WHERE id = $3
            RETURNING *
            `, [paid, wallet_id ?? null, id]
        );
        return toCamel(rows[0]);
    }
}