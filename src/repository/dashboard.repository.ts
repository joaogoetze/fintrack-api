import 'dotenv/config';
import { pool } from '../database';
import { toCamel, toCamelMany } from '../utils/case';
import { DueTransaction } from '../types/Dashboard';

export class DashboardRepository {

    async getSumary(month: string, workspaceId: number): Promise<any> {
        const { rows } = await pool.query(`
            SELECT
                (SELECT COALESCE(SUM(amount), 0)
                FROM expenses
                WHERE expenses.workspace_id = $2
                AND COALESCE(expenses.date, expenses.due_date, expenses.created_at::date, now()::date) >= $1::date
                AND COALESCE(expenses.date, expenses.due_date, expenses.created_at::date, now()::date) < ($1::date + INTERVAL '1 month')
                AND expenses.deleted_at IS NULL
                ) AS total_expenses,
                (SELECT COALESCE(SUM(amount), 0)
                FROM expenses
                WHERE expenses.workspace_id = $2
                AND COALESCE(expenses.date, expenses.due_date, expenses.created_at::date, now()::date) >= $1::date
                AND COALESCE(expenses.date, expenses.due_date, expenses.created_at::date, now()::date) < ($1::date + INTERVAL '1 month')
                AND expenses.paid = true
                AND expenses.deleted_at IS NULL
                ) AS paid_expenses,
                (SELECT COALESCE(SUM(amount), 0)
                FROM expenses
                WHERE expenses.workspace_id = $2
                AND COALESCE(expenses.date, expenses.due_date, expenses.created_at::date, now()::date) >= $1::date
                AND COALESCE(expenses.date, expenses.due_date, expenses.created_at::date, now()::date) < ($1::date + INTERVAL '1 month')
                AND expenses.paid = false
                AND expenses.deleted_at IS NULL
                ) AS unpaid_expenses,
                (SELECT COALESCE(SUM(amount), 0)
                FROM incomes
                WHERE incomes.workspace_id = $2
                AND COALESCE(incomes.date, incomes.due_date, incomes.created_at::date, now()::date) >= $1::date
                AND COALESCE(incomes.date, incomes.due_date, incomes.created_at::date, now()::date) < ($1::date + INTERVAL '1 month')
                AND incomes.deleted_at IS NULL
                ) AS total_income,
                (SELECT COALESCE(SUM(amount), 0)
                FROM incomes
                WHERE incomes.workspace_id = $2
                AND COALESCE(incomes.date, incomes.due_date, incomes.created_at::date, now()::date) >= $1::date
                AND COALESCE(incomes.date, incomes.due_date, incomes.created_at::date, now()::date) < ($1::date + INTERVAL '1 month')
                AND incomes.paid = true
                AND incomes.deleted_at IS NULL
                ) AS paid_income,
                (SELECT COALESCE(SUM(amount), 0)
                FROM incomes
                WHERE incomes.workspace_id = $2
                AND COALESCE(incomes.date, incomes.due_date, incomes.created_at::date, now()::date) >= $1::date
                AND COALESCE(incomes.date, incomes.due_date, incomes.created_at::date, now()::date) < ($1::date + INTERVAL '1 month')
                AND incomes.paid = false
                AND incomes.deleted_at IS NULL
                ) AS unpaid_income;
            `, [month + '-01', workspaceId]
        );
        return toCamel(rows[0]);
    }

    async getDueExpenses(month: string, workspaceId: number): Promise<DueTransaction[]> {
        const { rows } = await pool.query(`
            SELECT e.*, w.name as wallet_name, 'expense' AS type
            FROM expenses e
            LEFT JOIN wallets w ON e.wallet_id = w.id
            WHERE e.workspace_id = $2
            AND e.due_date >= $1::date
            AND e.due_date < ($1::date + INTERVAL '1 month')
            AND e.deleted_at IS NULL
            ORDER BY e.paid, e.due_date ASC
            `, [month + '-01', workspaceId]
        );
        return toCamelMany(rows);
    }

    async getDueIncomes(month: string, workspaceId: number): Promise<DueTransaction[]> {
        const { rows } = await pool.query(`
            SELECT i.*, w.name as wallet_name, 'income' AS type
            FROM incomes i
            LEFT JOIN wallets w ON i.wallet_id = w.id
            WHERE i.workspace_id = $2
            AND i.due_date >= $1::date
            AND i.due_date < ($1::date + INTERVAL '1 month')
            AND i.deleted_at IS NULL
            ORDER BY i.paid, i.due_date ASC
            `, [month + '-01', workspaceId]
        );
        return toCamelMany(rows);
    }

    async getCategoryEstimates(month: string, workspaceId: number): Promise<{
        id: number;
        name: string;
        estimatedAmount: number;
        marginPercent: number;
        spent: number;
    }[]> {
        const { rows } = await pool.query(`
            SELECT
                c.id,
                c.name,
                c.estimated_amount,
                COALESCE(c.margin_percent, 0) AS margin_percent,
                COALESCE(spent.total, 0) AS spent
            FROM categories c
            LEFT JOIN (
                SELECT e.category_id, SUM(e.amount) AS total
                FROM expenses e
                WHERE e.workspace_id = $2
                AND e.deleted_at IS NULL
                AND COALESCE(e.date, e.due_date, e.created_at::date, now()::date) >= $1::date
                AND COALESCE(e.date, e.due_date, e.created_at::date, now()::date) < ($1::date + INTERVAL '1 month')
                GROUP BY e.category_id
            ) spent ON spent.category_id = c.id
            WHERE c.workspace_id = $2
            AND c.deleted_at IS NULL
            AND c.estimated_amount IS NOT NULL
            ORDER BY c.name ASC
            `, [month + '-01', workspaceId]
        );
        return toCamelMany(rows);
    }
}