import { ExpenseRepository } from "../repository/expense.repository";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import { WalletRepository } from "../repository/wallet.repository";
import { CreateExpenseInput, UpdateExpenseInput, Expense, ExpenseListItem, ExpensesResponse } from "../types/Expense";
import { formatDateOnly, withDateOnly } from "../utils/dates";
import { materializeRecurring, toListResponse } from "../utils/transactions";

export class ExpenseService {
    constructor(
        private expenseRepository: ExpenseRepository,
        private recurringTransactionRepository: RecurringTransactionRepository,
        private walletRepository: WalletRepository
    ) { }

    async getExpenses(month: string): Promise<ExpensesResponse> {
        const expenses = await this.expenseRepository.getExpenses(month);
        await materializeRecurring({
            month,
            type: "expense",
            existing: expenses,
            listRecurring: (m, t) => this.recurringTransactionRepository.getRecurringTransactionByDate(m, t),
            create: (data) => this.createExpense(data),
        });
        const { items, total } = toListResponse<ExpenseListItem>(expenses);
        return { expenses: items, total };
    }

    async createExpense(data: CreateExpenseInput): Promise<Expense> {
        let { isRecurring, name, amount, date, dueDate, paid, walletId, recurringTransactionId } = data

        if (isRecurring) {
            recurringTransactionId = await this.recurringTransactionRepository.createRecurringTransacion({ type: "expense", name, amount, startDate: date, dueDate });
        }

        const isPaid = Boolean(paid && !isRecurring && walletId);

        const createdExpense = await this.expenseRepository.createExpense({ name, amount, date, dueDate, walletId, recurringTransactionId, paid: isPaid });

        if (walletId && isPaid) {
            await this.walletRepository.updateWalletValue(walletId, amount, "expense");
        }

        return withDateOnly(createdExpense);
    }

    async updateExpense(ex: UpdateExpenseInput): Promise<Expense> {
        const existing = await this.expenseRepository.getExpenseById(ex.id);

        if (!existing) {
            throw new Error("Despesa não encontrada");
        }

        if (existing.paid && existing.walletId) {
            await this.walletRepository.updateWalletValue(existing.walletId, Number(existing.amount), "income");
        }

        const newName = ex.name ?? existing.name;
        const newAmount = ex.amount ?? existing.amount;
        const newDate = formatDateOnly(ex.date ?? existing.date) ?? "";
        const newDueDate = formatDateOnly(ex.dueDate !== undefined ? ex.dueDate : existing.dueDate);
        const newWalletId = ex.walletId !== undefined ? ex.walletId : existing.walletId;

        const newPaid = Boolean((ex.paid ?? existing.paid) && newWalletId);

        const updatedExpense = await this.expenseRepository.updateExpense({
            id: ex.id, name: newName, amount: newAmount, date: newDate, dueDate: newDueDate, walletId: newWalletId, paid: newPaid
        });

        if (newPaid && newWalletId) {
            await this.walletRepository.updateWalletValue(newWalletId, newAmount, "expense");
        }
        if (ex.updateRecurringTransaction && ex.recurringTransactionId) {
            await this.recurringTransactionRepository.updateRecurringTransaction({ id: ex.recurringTransactionId, name: newName, amount: newAmount, dueDate: newDueDate })
        }

        return withDateOnly(updatedExpense);
    }

    async deleteExpense(id: number): Promise<Expense> {
        const existing = await this.expenseRepository.getExpenseById(id);

        if (!existing) {
            throw new Error("Despesa não encontrada");
        }
        if (existing.paid && existing.walletId) {
            await this.walletRepository.updateWalletValue(existing.walletId, Number(existing.amount), "income");
        }
        return withDateOnly(await this.expenseRepository.deleteExpense(id));
    }

    async updatePaidStatus(id: number, paid: boolean, walletId?: number, value?: number): Promise<Expense> {
        const existing = await this.expenseRepository.getExpenseById(id);

        if (!existing) {
            throw new Error("Despesa não encontrada");
        }

        if (paid) {
            if (!walletId) {
                throw new Error("walletId é obrigatório ao marcar como pago");
            }
            const updatedExpense = await this.expenseRepository.updatePaidStatus(id, true, walletId);
            await this.walletRepository.updateWalletValue(walletId, value ?? existing.amount, "expense");
            return withDateOnly(updatedExpense);
        }

        const storedWalletId = walletId ?? existing.walletId;
        if (storedWalletId) {
            await this.walletRepository.updateWalletValue(storedWalletId, value ?? existing.amount, "income");
        }
        return withDateOnly(await this.expenseRepository.updatePaidStatus(id, false, null));
    }
}