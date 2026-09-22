import { DashboardRepository } from "../repository/dashboard.repository";
import { ExpenseService } from "./expense.service";
import { IncomeService } from "./income.service";
import { format } from "date-fns";
import { Summary, DueExpense, DueTransaction } from "../types/Dashboard";

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

    async getDueExpenses(month: string): Promise<DueTransaction[]> {
        await this.expenseService.getExpenses(month);
        await this.incomeService.getIncomes(month);
        const [dueExpenses, dueIncomes] = await Promise.all([
            this.dashboardRepository.getDueExpenses(month),
            this.dashboardRepository.getDueIncomes(month),
        ]);
        const normalize = (e: DueExpense, type: DueTransaction["type"]): DueTransaction => ({
            ...e,
            type,
            amount: Number(e.amount),
            date: e.date ? format(new Date(e.date), "yyyy-MM-dd") : null,
            dueDate: e.dueDate ? format(new Date(e.dueDate), "yyyy-MM-dd") : null,
        });
        return [
            ...dueExpenses.map((e) => normalize(e, "expense")),
            ...dueIncomes.map((e) => normalize(e, "income")),
        ].sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate.localeCompare(b.dueDate);
        });
    }
}