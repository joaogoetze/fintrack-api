import 'dotenv/config';
import { pool } from '../database';

export class IncomeRepository {
    async getIncomes(month: string) {
        const { rows } = await pool.query(`
            SELECT i.*, w.name as wallet_name
            FROM incomes i
            LEFT JOIN wallets w ON i.wallet_id = w.id
            WHERE i.date >= $1::date
            AND i.date < ($1::date + INTERVAL '1 month')
            `, [month + '-01']
        );
        return rows;
    }
    async createIncome(name: string, value: number, date: Date, is_recurring: boolean, wallet_id?: number) {
        const { rows } = await pool.query(`
            INSERT INTO incomes
            (name, value, date, is_recurring, wallet_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `, [name, value, date, is_recurring, wallet_id || null]
        );
        return rows;
    }
}