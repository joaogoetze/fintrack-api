import 'dotenv/config';
import { pool } from '../database';
import { toCamel, toCamelMany } from '../utils/case';
import { Summary, DueExpense } from '../types/Dashboard';
import { Expense } from '../types/Expense';
import { Income } from '../types/Income';

export class DashboardRepository {

    async getSumary(month: string): Promise<Summary> {
        const { rows } = await pool.query(`
            SELECT
                (SELECT COALESCE(SUM(amount), 0)
                FROM expenses
                WHERE expenses.date >= $1::date
                AND date < ($1::date + INTERVAL '1 month')
                AND due_date IS NOT NULL
                AND expenses.deleted_at IS NULL
                ) AS total_expenses,
                (SELECT COALESCE(SUM(amount), 0)
                FROM incomes
                WHERE incomes.date >= $1::date
                AND date < ($1::date + INTERVAL '1 month')
                AND due_date IS NOT NULL
                AND incomes.deleted_at IS NULL
                ) AS total_income;
            `, [month + '-01']
        );
        return toCamel(rows[0]);
    }

    async getDueExpenses(month: string): Promise<Expense[]> {
        const { rows } = await pool.query(`
            SELECT e.*, w.name as wallet_name
            FROM expenses e
            LEFT JOIN wallets w ON e.wallet_id = w.id
            WHERE e.due_date >= $1::date
            AND e.due_date < ($1::date + INTERVAL '1 month')
            AND e.deleted_at IS NULL
            ORDER BY e.due_date ASC
            `, [month + '-01']
        );
        return toCamelMany(rows);
    }

    async getDueIncomes(month: string): Promise<Income[]> {
        const { rows } = await pool.query(`
            SELECT i.*, w.name as wallet_name
            FROM incomes i
            LEFT JOIN wallets w ON i.wallet_id = w.id
            WHERE i.due_date >= $1::date
            AND i.due_date < ($1::date + INTERVAL '1 month')
            AND i.deleted_at IS NULL
            ORDER BY i.due_date ASC
            `, [month + '-01']
        );
        return toCamelMany(rows);
    }
}