import { ExpenseRepository } from "../repository/expense.repository";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import { WalletRepository } from "../repository/wallet.repository";
import { parse, endOfMonth, setDate, format } from "date-fns";
import { CreateExpenseInput, UpdateExpenseInput } from "../types/Expense";
import { formatDateOnly, withDateOnly } from "../utils/dates";

export class ExpenseService {
    constructor(
        private expenseRepository: ExpenseRepository,
        private recurringTransactionRepository: RecurringTransactionRepository,
        private walletRepository: WalletRepository
    ) { }

    async getExpenses(month: string) {
        const expenses = await this.expenseRepository.getExpenses(month);
        const baseDate = month + '-01';
        const recurringTransactions = await this.recurringTransactionRepository.getRecurringTransactionByDate(month, "expense");
        const transactionsToCreate = recurringTransactions.filter((recurringTx) => {
            return !expenses.some(
                (expense) => expense.recurringTransactionId === recurringTx.id
            );
        });
        for (const recurringTx of transactionsToCreate) {
            let formattedDueDate = "";
            if (recurringTx.dueDate) {
                const targetMonthDate = parse(month, 'yyyy-MM', new Date());
                const lastDay = endOfMonth(targetMonthDate).getDate();
                const sourceDay = typeof recurringTx.dueDate === "string"
                    ? parseInt(String(recurringTx.dueDate).slice(8, 10), 10)
                    : new Date(recurringTx.dueDate).getDate();
                const targetDay = Math.min(sourceDay, lastDay);

                const targetDate = setDate(targetMonthDate, targetDay);
                formattedDueDate = format(targetDate, 'yyyy-MM-dd');
            }
            const toCreate: CreateExpenseInput = { name: recurringTx.name, amount: recurringTx.amount, date: baseDate, dueDate: formattedDueDate, isRecurring: false, paid: false }
            const createdExpense = await this.createExpense(toCreate);
            expenses.push(createdExpense);
        }
        const validExpenses = expenses.filter(e => e.deletedAt === null);
        const total = validExpenses.reduce((sum: number, e) => sum + Number(e.amount), 0);
        const formattedExpenses = validExpenses.map((expense) => ({
            id: expense.id,
            name: expense.name,
            amount: expense.amount,
            date: expense.date
                ? format(new Date(expense.date), "yyyy-MM-dd")
                : null,
            walletId: expense.walletId,
            walletName: expense.walletName,
            recurringTransactionId: expense.recurringTransactionId,
            dueDate: expense.dueDate
                ? format(new Date(expense.dueDate), "yyyy-MM-dd")
                : null,
            paid: expense.paid,
            deletedAt: expense.deletedAt,
        }));
        return { expenses: formattedExpenses, total };
    }

    async createExpense(data: CreateExpenseInput) {
        const { isRecurring, name, amount, date, dueDate, paid, walletId } = data

        let recurringTransactionId = null;

        if (isRecurring) {
            recurringTransactionId = await this.recurringTransactionRepository.createRecurringTransacion("expense", name, amount, date, dueDate);
        }

        const isPaid = Boolean(paid && !isRecurring && walletId);

        const createdExpense = await this.expenseRepository.createExpense(name, amount, date, dueDate, walletId, recurringTransactionId, isPaid);

        if (walletId && isPaid) {
            await this.walletRepository.updateWalletValue(walletId, amount, "expense");
        }

        return withDateOnly(createdExpense);
    }

    async updateExpense(ex: UpdateExpenseInput) {
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

        const updatedExpense = await this.expenseRepository.updateExpense(
            ex.id, newName, newAmount, newDate, newDueDate, newWalletId, newPaid
        );

        if (newPaid && newWalletId) {
            await this.walletRepository.updateWalletValue(newWalletId, newAmount, "expense");
        }
        if (ex.updateRecurringTransaction && ex.recurringTransactionId) {
            await this.recurringTransactionRepository.updateRecurringTransaction(ex.recurringTransactionId, newName, newAmount, newDueDate)
        }

        return withDateOnly(updatedExpense);
    }

    async deleteExpense(id: number) {
        const existing = await this.expenseRepository.getExpenseById(id);

        if (!existing) {
            throw new Error("Despesa não encontrada");
        }
        if (existing.paid && existing.walletId) {
            await this.walletRepository.updateWalletValue(existing.walletId, Number(existing.amount), "income");
        }
        return withDateOnly(await this.expenseRepository.deleteExpense(id));
    }

    async updatePaidStatus(id: number, paid: boolean, walletId?: number, value?: number) {
        const existing = await this.expenseRepository.getExpenseById(id);

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