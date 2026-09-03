import { ExpenseRepository } from "../repository/expense.repository";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import { WalletRepository } from "../repository/wallet.repository";
import { parse, endOfMonth, setDate, format } from "date-fns";

export class ExpenseService {
    constructor(
        private expenseRepository: ExpenseRepository, 
        private recurringTransactionRepository: RecurringTransactionRepository,
        private walletRepository: WalletRepository
    ) {}

    async getExpenses(month: string) {
        const expenses = await this.expenseRepository.getExpenses(month);

        const data = month + '-01';
                
        const rt = await this.recurringTransactionRepository.getRecurringTransactionByDate(month, "expense");
        
        const transacoesParaCriar = rt.filter((e) => {
            return !expenses.some(
            (expense) => expense.recurring_transaction_id === e.id
            );
        });

        for (const expense of transacoesParaCriar) {
            let data_pae = "";
            if (expense.due_date) {
                const targetMonthDate = parse(month, 'yyyy-MM', new Date());
                const lastDay = endOfMonth(targetMonthDate).getDate();
                const targetDay = Math.min(expense.due_date.getDate(), lastDay);
                
                const targetDate = setDate(targetMonthDate, targetDay);
                data_pae = format(targetDate, 'yyyy-MM-dd');
            }
            const jones = await this.createExpense(expense.name, expense.amount, data, data_pae, false, undefined, expense.id, false);
            expenses.push(jones);
        }        
        const total = expenses.reduce((sum: number, e) => sum + Number(e.amount), 0);
        return { expenses, total };
    }

    async createExpense(name: string, value: number, date: string, due_date: string, is_recurring: boolean, wallet_id?: number, recurring_transaction_id?: number, paide?: boolean) {
        if (is_recurring) {
            recurring_transaction_id = await this.recurringTransactionRepository.createRecurringTransacion("expense", name, value, date, due_date);
        }        
        let paid = false;
        paid = (!paide ? paide : !is_recurring) || false;
        if (!wallet_id) paid = false;
        
        const createdExpense = await this.expenseRepository.createExpense(name, value, date, due_date, wallet_id, recurring_transaction_id, paid);
        
        // Only update wallet for non-recurring (paid) expenses
        if (wallet_id && paid) {
            await this.walletRepository.updateWalletValue(wallet_id, value, "expense");
        }
        
        return createdExpense;
    }

    async updateExpense(id: number, name: string, value: number, date: string, due_date: string | null, wallet_id?: number | null) {
        const existing = await this.expenseRepository.getExpenseById(id);

        if (!existing) {
            throw new Error("Despesa não encontrada");
        }

        // Revert old wallet effect
        if (existing.paid && existing.wallet_id) {
            await this.walletRepository.updateWalletValue(existing.wallet_id, Number(existing.amount), "income");
        }

        // Clearing wallet on a paid transaction sets paid=false
        let newPaid = existing.paid;
        if (existing.paid && !wallet_id) {
            newPaid = false;
        }

        const updatedExpense = await this.expenseRepository.updateExpense(
            id, name, value, date, due_date ?? null, wallet_id ?? null, newPaid
        );

        // Apply new wallet effect
        if (newPaid && wallet_id) {
            await this.walletRepository.updateWalletValue(wallet_id, value, "expense");
        }

        return updatedExpense;
    }

async updatePaidStatus(id: number, paid: boolean, wallet_id?: number, value?: number) {
        const existing = await this.expenseRepository.getExpenseById(id);

        if (paid) {
            // Marking as paid: wallet_id is mandatory
            if (!wallet_id) {
                throw new Error("wallet_id é obrigatório ao marcar como pago");
            }
            const updatedExpense = await this.expenseRepository.updatePaidStatus(id, true, wallet_id);
            await this.walletRepository.updateWalletValue(wallet_id, value ?? existing.amount, "expense");
            return updatedExpense;
        }

        // Marking as unpaid: reverse using the stored wallet, then clear wallet_id
        const storedWalletId = wallet_id ?? existing.wallet_id;
        if (storedWalletId) {
            await this.walletRepository.updateWalletValue(storedWalletId, value ?? existing.amount, "income");
        }
        return await this.expenseRepository.updatePaidStatus(id, false, null);
    }

    async softDeleteExpense(id: number) {
        const existing = await this.expenseRepository.getExpenseById(id);

        if (!existing) {
            throw new Error("Despesa não encontrada");
        }

        if (existing.recurring_transaction_id) {
            throw new Error("Despesas recorrentes não podem ser excluídas");
        }

        if (existing.paid && existing.wallet_id) {
            await this.walletRepository.updateWalletValue(existing.wallet_id, Number(existing.amount), "income");
        }

        return await this.expenseRepository.softDeleteExpense(id);
    }
}