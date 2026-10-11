import { DashboardRepository } from "../repository/dashboard.repository";
import { ExpenseService } from "./expense.service";
import { IncomeService } from "./income.service";
import { formatDateOnly } from "../utils/dates";
import { Summary, DueTransaction } from "../types/Dashboard";

export class DashboardService {
    constructor(
        private dashboardRepository: DashboardRepository,
        private expenseService: ExpenseService,
        private incomeService: IncomeService
    ) { }

    async getSumary(month: string): Promise<Summary> {
        let summary = await this.dashboardRepository.getSumary(month);

        if (Number(summary.totalExpenses) == 0 && Number(summary.totalIncome) == 0) {
            await this.expenseService.getExpenses(month);
            await this.incomeService.getIncomes(month);
            summary = await this.dashboardRepository.getSumary(month);
        }

        const totalIncome = Number(summary.totalIncome);
        const paidIncome = Number(summary.paidIncome || 0);
        const unpaidIncome = Number(summary.unpaidIncome || 0);

        const totalExpenses = Number(summary.totalExpenses);
        const paidExpenses = Number(summary.paidExpenses || 0);
        const unpaidExpenses = Number(summary.unpaidExpenses || 0);

        return { 
            totalIncome, 
            paidIncome,
            unpaidIncome,
            totalExpenses, 
            paidExpenses,
            unpaidExpenses,
            balance: paidIncome - paidExpenses,
            projectedBalance: totalIncome - totalExpenses
        };
    }

    async getDueTransactions(month: string): Promise<DueTransaction[]> {
        await this.expenseService.getExpenses(month);
        await this.incomeService.getIncomes(month);
        const [dueExpenses, dueIncomes] = await Promise.all([
            this.dashboardRepository.getDueExpenses(month),
            this.dashboardRepository.getDueIncomes(month),
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
            return 0
        });

        transactions.sort(function (a, b) {
            if(a.dueDate && b.dueDate) {
                if (a.paid) {
                    return 1;
                }
                // if (a.dueDate < b.dueDate) {
                //     return -1;
                // }
            }
            return 0
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