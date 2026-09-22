import 'dotenv/config';
import { pool } from '../database';
import { toCamel, toCamelMany } from '../utils/case';
import { Income, CreateIncomeData, UpdateIncomeData } from '../types/Income';

export class IncomeRepository {

    async getIncomes(month: string): Promise<Income[]> {
        const { rows } = await pool.query(`
            SELECT i.*, w.name as wallet_name
            FROM incomes i
            LEFT JOIN wallets w ON i.wallet_id = w.id
            WHERE i.date >= $1::date
            AND i.date < ($1::date + INTERVAL '1 month')
            `, [month + '-01']
        );
        return toCamelMany(rows);
    }

    async createIncome(data: CreateIncomeData): Promise<Income> {
        const { rows } = await pool.query(`
            INSERT INTO incomes
            (name, amount, date, due_date, wallet_id, recurring_transaction_id, paid)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
            `, [data.name, data.amount, data.date, data.dueDate || null, data.walletId || null, data.recurringTransactionId || null, data.paid ?? true]
        );
        return toCamel(rows[0]);
    }

    async updatePaidStatus(id: number, paid: boolean, wallet_id?: number | null): Promise<Income> {
        const { rows } = await pool.query(`
            UPDATE incomes
            SET paid = $1, wallet_id = $2
            WHERE id = $3
            RETURNING *
            `, [paid, wallet_id ?? null, id]
        );
        return toCamel(rows[0]);
    }

    async updateIncome(data: UpdateIncomeData): Promise<Income> {
        const { rows } = await pool.query(`
            UPDATE incomes
            SET name = $1, amount = $2, date = $3, due_date = $4, wallet_id = $5, paid = $6
            WHERE id = $7
            RETURNING *
            `, [data.name, data.amount, data.date, data.dueDate, data.walletId, data.paid, data.id]
        );
        return toCamel(rows[0]);
    }

    async getIncomeById(id: number): Promise<Income | undefined> {
        const { rows } = await pool.query(`
            SELECT * FROM incomes WHERE id = $1
            `, [id]
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
}