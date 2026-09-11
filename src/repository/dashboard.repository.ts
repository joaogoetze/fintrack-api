import 'dotenv/config';
import { pool } from '../database';

export class DashboardRepository {
    async getSumary(month: string) {
        console.log("month", month);
        
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
            `,[month + '-01']
        );
        return rows[0];
    }

    async getDueExpenses(month: string) {
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
        return rows;
    }
}