import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import { RecurringTransactionsResponse } from "../types/RecurringTransaction";

export class RecurringTransactionService {
    constructor(private recurringTransactionRepository: RecurringTransactionRepository) {}

    async getRecurringTransactions(workspaceId: number, type?: string): Promise<RecurringTransactionsResponse> {
        const items = await this.recurringTransactionRepository.getRecurringTransactions(workspaceId, type);

        const totalIncomes = items
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalExpenses = items
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        return {
            recurringTransactions: items,
            total: items.length,
            totalIncomes,
            totalExpenses,
            balance: totalIncomes - totalExpenses,
        };
    }
}

