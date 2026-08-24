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
            `, [month + '-01']
        );
        return rows;
    }
    async createExpense(name: string, value: number, date: string, due_date?: string, wallet_id?: number, rtId?: number) {
        
        const { rows } = await pool.query(`
            INSERT INTO expenses
            (name, amount, date, due_date, wallet_id, recurring_transaction_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `, [name, value, date, due_date || null, wallet_id || null, rtId || null]
        );
        return rows[0];
    }
}