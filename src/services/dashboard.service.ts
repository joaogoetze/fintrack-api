import { DashboardRepository } from "../repository/dashboard.repository";
import { ExpenseService } from "./expense.service";
import { IncomeService } from "./income.service";
import { formatDateOnly } from "../utils/dates";
import { Summary, DueTransaction, CategoryEstimate } from "../types/Dashboard";

export class DashboardService {
    constructor(
        private dashboardRepository: DashboardRepository,
        private expenseService: ExpenseService,
        private incomeService: IncomeService
    ) { }

    async getSumary(month: string, workspaceId: number): Promise<Summary> {
        let summary = await this.dashboardRepository.getSumary(month, workspaceId);

        if (Number(summary.totalExpenses) === 0 && Number(summary.totalIncome) === 0) {
            await this.expenseService.getExpenses(month, workspaceId);
            await this.incomeService.getIncomes(month, workspaceId);
            summary = await this.dashboardRepository.getSumary(month, workspaceId);
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
            const marginPercent = Number(row.marginPercent || 0);
            const spent = Number(row.spent || 0);
            const cap = Math.round(estimatedAmount * (1 + marginPercent / 100) * 100) / 100;
            const remaining = Math.max(0, Math.round((cap - spent) * 100) / 100);
            return {
                categoryId: row.id,
                name: row.name,
                estimatedAmount,
                marginPercent,
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
            balance: paidIncome - paidExpenses,
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

        transactions.sort(function (a, b) {
            if (a.paid !== b.paid) {
                return a.paid ? 1 : -1;
            }
            
            if(a.dueDate && b.dueDate) {
                if (a.dueDate > b.dueDate) {
                    return 1;
                }
                if (a.dueDate < b.dueDate) {
                    return -1;
                }
            }
            return 0;
        });

        transactions.sort(function (a, b) {
            if(a.dueDate && b.dueDate) {
                if (a.paid) {
                    return 1;
                }
            }
            return 0;
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