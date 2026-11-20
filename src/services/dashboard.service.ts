import { DashboardRepository } from "../repository/dashboard.repository";
import { ExpenseService } from "./expense.service";
import { IncomeService } from "./income.service";
import { Summary, DueTransaction, CategoryEstimate } from "../types/Dashboard";
import { formatDateOnly } from "../utils/dates";

export class DashboardService {
    constructor(
        private dashboardRepository: DashboardRepository,
        private expenseService: ExpenseService,
        private incomeService: IncomeService
    ) { }

    async getSummary(month: string, workspaceId: number): Promise<Summary> {
        let summary = await this.dashboardRepository.getSummary(month, workspaceId);

        if (Number(summary.totalExpenses) === 0 && Number(summary.totalIncome) === 0) {
            await this.expenseService.getExpenses(month, workspaceId);
            await this.incomeService.getIncomes(month, workspaceId);
            summary = await this.dashboardRepository.getSummary(month, workspaceId);
        }

        const totalIncome = Number(summary.totalIncome);
        const paidIncome = Number(summary.paidIncome || 0);
        const unpaidIncome = Number(summary.unpaidIncome || 0);

        const totalExpenses = Number(summary.totalExpenses);
        const paidExpenses = Number(summary.paidExpenses || 0);
        const unpaidExpenses = Number(summary.unpaidExpenses || 0);

        const estimateRows = await this.dashboardRepository.getCategoryEstimates(month, workspaceId);
        const categoryEstimates: CategoryEstimate[] = estimateRows.map((row) => {
            const estimatedAmount = Number(row.estimatedAmount);
            const spent = Number(row.spent || 0);
            const cap = Math.round(estimatedAmount * 100) / 100;
            const remaining = Math.max(0, Math.round((cap - spent) * 100) / 100);
            return {
                categoryId: row.id,
                name: row.name,
                estimatedAmount,
                cap,
                spent,
                remaining,
            };
        });
        const categoryEstimateRemaining = categoryEstimates.reduce(
            (sum, item) => sum + item.remaining,
            0
        );

        return { 
            totalIncome, 
            paidIncome,
            unpaidIncome,
            totalExpenses, 
            paidExpenses,
            unpaidExpenses,
            categoryEstimateRemaining,
            categoryEstimates,
            confirmedBalance: paidIncome - paidExpenses,
            projectedBalance: totalIncome - (totalExpenses + categoryEstimateRemaining)
        };
    }

    async getDueTransactions(month: string, workspaceId: number): Promise<DueTransaction[]> {
        await this.expenseService.getExpenses(month, workspaceId);
        await this.incomeService.getIncomes(month, workspaceId);
        const [dueExpenses, dueIncomes] = await Promise.all([
            this.dashboardRepository.getDueExpenses(month, workspaceId),
            this.dashboardRepository.getDueIncomes(month, workspaceId),
        ]);
        
        const transactions = [...dueExpenses, ...dueIncomes];

        const dateKey = (value: string | Date | null | undefined): string | null => {
            if (!value) return null;
            return typeof value === "string" ? value.slice(0, 10) : formatDateOnly(value);
        };

        transactions.sort((a, b) => {
            if (a.paid !== b.paid) {
                return a.paid ? 1 : -1;
            }

            if (!a.paid) {
                const dueA = dateKey(a.dueDate);
                const dueB = dateKey(b.dueDate);
                if (dueA === dueB) return 0;
                if (!dueA) return 1;
                if (!dueB) return -1;
                return dueA < dueB ? -1 : 1;
            }

            const dateA = dateKey(a.date);
            const dateB = dateKey(b.date);
            if (dateA === dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateA > dateB ? -1 : 1;
        });

        const normalize = (e: DueTransaction): DueTransaction => ({
            ...e,
            amount: Number(e.amount),
            date: formatDateOnly(e.date),
            dueDate: formatDateOnly(e.dueDate),
        });

        return transactions.map((e) => normalize(e));
    }
}