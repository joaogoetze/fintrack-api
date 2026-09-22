import 'dotenv/config';
import { pool } from '../database';
import { toCamelMany } from '../utils/case';
import { RecurringTransaction, CreateRecurringTransactionData, UpdateRecurringTransactionData } from '../types/RecurringTransaction';

export class RecurringTransactionRepository {

    async createRecurringTransacion(data: CreateRecurringTransactionData): Promise<number> {
        
        const { rows } = await pool.query(`
            INSERT INTO recurring_transactions
            (type, name, amount, start_date, due_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            `, [data.type, data.name, data.amount, data.startDate, data.dueDate ?? null]
        );
        return rows[0].id;
    }

    async getRecurringTransactionByDate(date: string, type: string): Promise<RecurringTransaction[]> {
        
        const { rows } = await pool.query(`
            SELECT * FROM recurring_transactions
            where start_date <= $1 AND type = $2`,[date + '-01', type]);
            return toCamelMany(rows);
    }

    async updateRecurringTransaction(data: UpdateRecurringTransactionData): Promise<void> {
        await pool.query(`
            UPDATE recurring_transactions 
            SET name = $1, amount = $2, due_date = $3
            WHERE id = $4`,
        [data.name, data.amount, data.dueDate, data.id]);
    }
}