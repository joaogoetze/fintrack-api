import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import {
    CreateRecurringTransactionInput,
    RecurringTransactionItem,
    RecurringTransactionsResponse,
    UpdateRecurringTransactionInput
} from "../types/RecurringTransaction";
import { AppError } from "../utils/errors";

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

    async createRecurringTransaction(data: CreateRecurringTransactionInput): Promise<RecurringTransactionItem> {
        return await this.recurringTransactionRepository.createRecurringTransacion(data);
    }

    async updateRecurringTransaction(data: UpdateRecurringTransactionInput, workspaceId: number): Promise<RecurringTransactionItem> {
        const updated = await this.recurringTransactionRepository.updateRecurringTransaction(data, workspaceId);
        if (!updated) {
            throw new AppError(404, "Transação recorrente não encontrada");
        }
        return updated;
    }

    async deleteRecurringTransaction(id: number, workspaceId: number): Promise<RecurringTransactionItem> {
        const deleted = await this.recurringTransactionRepository.deleteRecurringTransaction(id, workspaceId);
        if (!deleted) {
            throw new AppError(404, "Transação recorrente não encontrada");
        }
        return deleted;
    }
}
