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
            if (expenses.length <= 0 && rt.length > 0) {
                return rt;
            }
            for (const x of expenses) {
                if (e.id != x.recurring_transaction_id) {
                    return e;
                }
            }
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
        console.log("PAIDEEE", paide);
        console.log("IS RECURRING", is_recurring);
        
        // Recurring expenses are created as unpaid (paid=false), normal expenses as paid=true
        const paid = !paide ? paide : !is_recurring;
        
        console.log("PAID", paid);
        
        const createdExpense = await this.expenseRepository.createExpense(name, value, date, due_date, wallet_id, recurring_transaction_id, paid);
        
        // Only update wallet for non-recurring (paid) expenses
        if (wallet_id && paid) {
            await this.walletRepository.updateWalletValue(wallet_id, value, "expense");
        }
        
        return createdExpense;
    }

    async updatePaidStatus(id: number, paid: boolean, wallet_id?: number, value?: number) {
        const updatedExpense = await this.expenseRepository.updatePaidStatus(id, paid);
        
        // Adjust wallet when paid status changes
        if (wallet_id && value !== undefined) {
            if (paid) {
                // Marking as paid: subtract from wallet
                await this.walletRepository.updateWalletValue(wallet_id, value, "expense");
            } else {
                // Marking as unpaid: add back to wallet (reverse)
                await this.walletRepository.updateWalletValue(wallet_id, value, "income");
            }
        }
        
        return updatedExpense;
    }
}