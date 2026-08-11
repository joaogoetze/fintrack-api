import { IncomeRepository } from "../repository/income.repository";

export class IncomeService {
    constructor(private incomeRepository: IncomeRepository) {}

    async getIncomes(month: string) {
        const incomes = await this.incomeRepository.getIncomes(month);
        return incomes;
    }

    async createIncome(name: string, value: number, date: Date, is_recurring: boolean, wallet_id?: number) {
        const createdIncome = await this.incomeRepository.createIncome(name, value, date, is_recurring, wallet_id);
        return createdIncome;
    }
}