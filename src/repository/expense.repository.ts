import 'dotenv/config';
import { pool } from '../database';

export class ExpenseRepository {
    async getExpenses(month: string) {
        
        const { rows } = await pool.query(`
            SELECT e.*, w.name as wallet_name
            FROM expenses e
            LEFT JOIN wallets w ON e.wallet_id = w.id
            WHERE e.date >= $1::date
            AND e.date < ($1::date + INTERVAL '1 month')
            AND e.deleted_at IS NULL
            `, [month + '-01']
        );
        return rows;
    }
    async createExpense(name: string, value: number, date: string, due_date?: string, wallet_id?: number, rtId?: number, paid?: boolean) {
        
        const { rows } = await pool.query(`
            INSERT INTO expenses
            (name, amount, date, due_date, wallet_id, recurring_transaction_id, paid)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
            `, [name, value, date, due_date || null, wallet_id || null, rtId || null, paid ?? true]
        );
        return rows[0];
    }
    async updatePaidStatus(id: number, paid: boolean, wallet_id?: number | null) {
        const { rows } = await pool.query(`
            UPDATE expenses
            SET paid = $1, wallet_id = $2
            WHERE id = $3
            RETURNING *
            `, [paid, wallet_id ?? null, id]
        );
        return rows[0];
    }
    async getExpenseById(id: number) {
        const { rows } = await pool.query(`
            SELECT * FROM expenses WHERE id = $1
            `, [id]
        );
        return rows[0];
    }
    async softDeleteExpense(id: number) {
        const { rows } = await pool.query(`
            UPDATE expenses
            SET deleted_at = now()
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING *
            `, [id]
        );
        return rows[0];
    }
}