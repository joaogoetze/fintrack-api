import 'dotenv/config';
import { pool } from '../database';

export class DashboardRepository {
    async getSumary(month: string) {
        const { rows } = await pool.query(`
            SELECT
                (SELECT COALESCE(SUM(amount), 0)
                FROM expenses
                WHERE expenses.date >= $1::date
                AND date < ($1::date + INTERVAL '1 month')
                ) AS total_expenses,

                (SELECT COALESCE(SUM(amount), 0)
                FROM incomes
                WHERE incomes.date >= $1::date
                AND date < ($1::date + INTERVAL '1 month')
                ) AS total_income;
            `,[month + '-01']
        );
        return rows[0];
    }
}