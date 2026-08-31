import { DashboardRepository } from "../repository/dashboard.repository";
import { ExpenseRepository } from "../repository/expense.repository";
import { IncomeRepository } from "../repository/income.repository";
import { ExpenseService } from "./expense.service";
import { WalletRepository } from "../repository/wallet.repository";
import { IncomeService } from "./income.service";

import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
export class DashboardService {
    constructor(private dashboardRepository: DashboardRepository) {}

    async getSumary(month: string) {
        const sumary = await this.dashboardRepository.getSumary(month);
        console.log("sumary" , sumary);
        if ( sumary.total_expenses == 0 && sumary.total_income == 0) {
            console.log("Tá duro");
            
            const expenseRepository = new ExpenseRepository();
            const incomeRepository = new IncomeRepository();
            const walletRepository = new WalletRepository();
            const recurringTransactionRepository = new RecurringTransactionRepository();
            const expenseService = new ExpenseService(expenseRepository, recurringTransactionRepository, walletRepository);
            const incomeService = new IncomeService(incomeRepository, recurringTransactionRepository, walletRepository)
            await expenseService.getExpenses(month);
            await incomeService.getIncomes(month);

            const sumary2 = await this.dashboardRepository.getSumary(month);
            sumary2.balance = sumary2.total_income - sumary2.total_expenses;
            return sumary2;
        } else {
        sumary.balance = sumary.total_income - sumary.total_expenses;
        return sumary;
        }
        
        
    }
}