import { ExpenseRepository } from "../repository/expense.repository";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import { WalletRepository } from "../repository/wallet.repository";
import { Expense, ExpenseItem, ExpensesResponse, CreateExpenseRequest, UpdateExpenseRequest, UpdateExpensePaidStatusRequest } from "../types/Expense";
import { formatDateOnly, withDateOnly } from "../utils/dates";
import { materializeRecurring, toListResponse } from "../utils/transactions";

export class ExpenseService {
    constructor(
        private expenseRepository: ExpenseRepository,
        private recurringTransactionRepository: RecurringTransactionRepository,
        private walletRepository: WalletRepository
    ) { }

    async getExpenses(month: string, workspaceId: number): Promise<ExpensesResponse> {
        const expenses = await this.expenseRepository.getExpenses(month, workspaceId);
        
        await materializeRecurring({
            month,
            type: "expense",
            workspaceId,
            existing: expenses,
            listRecurring: (m, t, wsId) => this.recurringTransactionRepository.getRecurringTransactionByDate(m, t, wsId),
            create: (data) => this.createExpense(data),
        });
        const { items, total, totalPaid, totalUnpaid } = toListResponse<ExpenseItem>(expenses);
        return { expenses: items, total, totalPaid, totalUnpaid };
    }

    async createExpense(data: CreateExpenseRequest): Promise<Expense> {
        let { isRecurring, name, amount, date, dueDate, paid, walletId, recurringTransactionId, workspaceId, createdBy } = data;

        if (isRecurring) {
            const startDate = date || dueDate || `${new Date().toISOString().slice(0, 10)}`;
            recurringTransactionId = await this.recurringTransactionRepository.createRecurringTransacion({
                type: "expense",
                name,
                amount,
                startDate,
                dueDate,
                workspaceId
            });
        }

        const isPaid = Boolean(paid && !isRecurring && walletId);

        const createdExpense = await this.expenseRepository.createExpense({
            name,
            amount,
            date: date || null,
            dueDate: dueDate || null,
            walletId: walletId || null,
            recurringTransactionId: recurringTransactionId || null,
            paid: isPaid,
            workspaceId,
            createdBy: createdBy || null
        });

        if (walletId && isPaid) {
            await this.walletRepository.updateWalletValue({
                id: walletId, 
                balance: amount, 
                operation: "expense"
            });
        }

        return withDateOnly(createdExpense);
    }

    async updateExpense(ex: UpdateExpenseRequest, workspaceId: number): Promise<Expense> {
        const existing = await this.expenseRepository.getExpenseById(ex.id, workspaceId);

        if (!existing) {
            throw new Error("Despesa não encontrada");
        }

        if (existing.paid && existing.walletId) {
            await this.walletRepository.updateWalletValue({
                id: existing.walletId, 
                balance: existing.amount, 
                operation: "income"
            });
        }

        const newName = ex.name ?? existing.name;
        const newAmount = ex.amount ?? existing.amount;
        const newDate = formatDateOnly(ex.date !== undefined ? ex.date : existing.date);
        const newDueDate = formatDateOnly(ex.dueDate !== undefined ? ex.dueDate : existing.dueDate);
        const newWalletId = ex.walletId !== undefined ? ex.walletId : existing.walletId;

        const newPaid = Boolean((ex.paid ?? existing.paid) && newWalletId);

        const updatedExpense = await this.expenseRepository.updateExpense({
            id: ex.id, 
            name: newName, 
            amount: newAmount, 
            date: newDate, 
            dueDate: newDueDate, 
            walletId: newWalletId, 
            paid: newPaid,
            workspaceId
        });

        if (newPaid && newWalletId) {
            await this.walletRepository.updateWalletValue({
                id: newWalletId, 
                balance: newAmount, 
                operation: "expense" 
            });
        }
        if (ex.updateRecurringTransaction && ex.recurringTransactionId) {
            await this.recurringTransactionRepository.updateRecurringTransaction({ 
                id: ex.recurringTransactionId, 
                name: newName, 
                amount: newAmount, 
                dueDate: newDueDate 
            });
        }

        return withDateOnly(updatedExpense);
    }

    async deleteExpense(id: number, workspaceId: number): Promise<Expense> {
        const existing = await this.expenseRepository.getExpenseById(id, workspaceId);

        if (!existing) {
            throw new Error("Despesa não encontrada");
        }
        if (existing.paid && existing.walletId) {
            await this.walletRepository.updateWalletValue({
                id: existing.walletId, 
                balance: existing.amount, 
                operation: "income"
            });
        }
        return withDateOnly(await this.expenseRepository.deleteExpense(id));
    }

    async updatePaidStatus(data: UpdateExpensePaidStatusRequest, workspaceId: number): Promise<Expense> {
        const { id, paid, walletId, amount, date } = data;
        const existing = await this.expenseRepository.getExpenseById(id, workspaceId);

        if (!existing) {
            throw new Error("Despesa não encontrada");
        }

        if (paid) {
            if (!walletId) {
                throw new Error("walletId é obrigatório ao marcar como pago");
            }
            const updatedExpense = await this.expenseRepository.updatePaidStatus(id, true, walletId, date);
            await this.walletRepository.updateWalletValue({ 
                id: walletId, 
                balance: amount ?? existing.amount, 
                operation: "expense" 
            });
            return withDateOnly(updatedExpense);
        }

        const storedWalletId = walletId ?? existing.walletId;
        if (storedWalletId) {
            await this.walletRepository.updateWalletValue({
                id: storedWalletId, 
                balance: amount ?? existing.amount, 
                operation: "income" 
            });
        }
        return withDateOnly(await this.expenseRepository.updatePaidStatus(id, false, null));
    }
}