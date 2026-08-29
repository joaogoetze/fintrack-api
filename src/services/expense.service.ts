import { ExpenseRepository } from "../repository/expense.repository";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import { WalletRepository } from "../repository/wallet.repository";

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
                    const day = expense.due_date.getDate();
                    data_pae = month + '-' + day;
                    
                }
                const jones = await this.createExpense(expense.name, expense.amount, data, data_pae, false, undefined, expense.id, false);
                expenses.push(jones);
        }        
        return expenses;
    }

    async createExpense(name: string, value: number, date: string, due_date: string, is_recurring: boolean, wallet_id?: number, recurring_transaction_id?: number, paide?: boolean) {
        if (is_recurring) {
            recurring_transaction_id = await this.recurringTransactionRepository.createRecurringTransacion("expense", name, value, date, due_date);
        }        
        
        // Recurring expenses are created as unpaid (paid=false), normal expenses as paid=true
        let paid = !paide ? paide : !is_recurring;
        if (!wallet_id) paid = false;
        
        const createdExpense = await this.expenseRepository.createExpense(name, value, date, due_date, wallet_id, recurring_transaction_id, paid);
        
        // Only update wallet for non-recurring (paid) expenses
        if (wallet_id && paid) {
            await this.walletRepository.updateWalletValue(wallet_id, value, "expense");
        }
        
        return createdExpense;
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
}