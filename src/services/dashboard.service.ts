import { DashboardRepository } from "../repository/dashboard.repository";
import { ExpenseService } from "./expense.service";
import { IncomeService } from "./income.service";

export class DashboardService {
    constructor(
        private dashboardRepository: DashboardRepository,
        private expenseService: ExpenseService,
        private incomeService: IncomeService
    ) {}

    async getSumary(month: string) {
        const sumary = await this.dashboardRepository.getSumary(month);
        if ( sumary.total_expenses == 0 && sumary.total_income == 0) {
            // Garante que instâncias recorrentes do mês sejam geradas
            await this.expenseService.getExpenses(month);
            await this.incomeService.getIncomes(month);

            const sumary2 = await this.dashboardRepository.getSumary(month);
            console.log('SSSS', sumary2);
            
            sumary2.balance = sumary2.total_income - sumary2.total_expenses;
            return sumary2;
        } else {
        sumary.balance = sumary.total_income - sumary.total_expenses;
        return sumary;
        }
    }

    async getDueExpenses(month: string) {
        // Garante que instâncias recorrentes do mês sejam geradas
        await this.expenseService.getExpenses(month);
        return await this.dashboardRepository.getDueExpenses(month);
    }
}