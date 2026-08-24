import 'dotenv/config';
import { pool } from '../database';

export class RecurringTransactionRepository {
    async createRecurringTransacion(
        type: string, 
        name: string, 
        amount: number,
        start_date: string,
        due_date?: string
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

    async getRecurringTransactionByDate(date: string) {
        
        const { rows } = await pool.query(`
            SELECT * FROM recurring_transactions
            where start_date <= $1`,[date + '-01']);
            return rows;
    }
}