import 'dotenv/config';
import { pool } from '../database';
import { toCamelMany } from '../utils/case';

export class RecurringTransactionRepository {
    async createRecurringTransacion(
        type: string, 
        name: string, 
        amount: number,
        start_date: string,
        due_date?: string | null
    ) {
        
        const { rows } = await pool.query(`
            INSERT INTO recurring_transactions
            (type, name, amount, start_date, due_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            `, [type, name, amount, start_date, due_date]
        );
        return rows[0].id;
    }

    async getRecurringTransactionByDate(date: string, type: string) {
        
        const { rows } = await pool.query(`
            SELECT * FROM recurring_transactions
            where start_date <= $1 AND type = $2`,[date + '-01', type]);
            return toCamelMany(rows);
    }

    async updateRecurringTransaction(id: number, name: string, amount: number, due_date: string | null) {
        const { rows } = await pool.query(`
            UPDATE recurring_transactions 
            SET name = $1, amount = $2, due_date = $3
            WHERE id = $4`,
        [name, amount, due_date, id]);

        return rows;
    }
}