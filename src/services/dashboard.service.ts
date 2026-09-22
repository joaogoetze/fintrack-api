import { DashboardRepository } from "../repository/dashboard.repository";
import { ExpenseService } from "./expense.service";
import { IncomeService } from "./income.service";
import { format } from "date-fns";
import { Summary, DueExpense } from "../types/Dashboard";

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
        const totalExpenses = Number(summary.totalExpenses);
        return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
    }

    async getDueExpenses(month: string): Promise<DueExpense[]> {
        await this.expenseService.getExpenses(month);
        const dueExpenses = await this.dashboardRepository.getDueExpenses(month);
        return dueExpenses.map((e) => ({
            ...e,
            amount: Number(e.amount),
            date: e.date ? format(new Date(e.date), "yyyy-MM-dd") : null,
            dueDate: e.dueDate ? format(new Date(e.dueDate), "yyyy-MM-dd") : null,
        }));
    }
}