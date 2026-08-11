import 'dotenv/config';
import { pool } from '../database';

export class ExpenseRepository {
    async getExpenses(month: string) {
        console.log("DATEE", month);
        
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
    async createExpense(name: string, value: number, date: Date, is_recurring: boolean, wallet_id?: number) {
        const { rows } = await pool.query(`
            INSERT INTO expenses
            (name, amount, date, is_recurring, wallet_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `, [name, value, date, is_recurring, wallet_id || null]
        );
        return rows;
    }
}