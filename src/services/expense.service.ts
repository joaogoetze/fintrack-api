import { ExpenseRepository } from "../repository/expense.repository";

export class ExpenseService {
    constructor(private expenseRepository: ExpenseRepository) {}

    async getExpenses(month: string) {
        const expenses = await this.expenseRepository.getExpenses(month);
        return expenses;
    }

    async createExpense(name: string, value: number, date: Date, is_recurring: boolean, wallet_id?: number) {
        const createdExpense = await this.expenseRepository.createExpense(name, value, date, is_recurring, wallet_id);
        return createdExpense;
    }
}