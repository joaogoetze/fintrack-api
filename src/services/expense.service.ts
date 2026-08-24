import { ExpenseRepository } from "../repository/expense.repository";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";

export class ExpenseService {
    constructor(private expenseRepository: ExpenseRepository, private recurringTransactionRepository: RecurringTransactionRepository) {}

    async getExpenses(month: string) {
        const expenses = await this.expenseRepository.getExpenses(month);

        const data = month + '-01';
                
        const rt = await this.recurringTransactionRepository.getRecurringTransactionByDate(month);
        
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
                const jones = await this.createExpense(expense.name, expense.amount, data, data_pae, false, undefined, expense.id);
                expenses.push(jones);
        }        
        return expenses;
    }

    async createExpense(name: string, value: number, date: string, due_date: string, is_recurring: boolean, wallet_id?: number, recurring_transaction_id?: number) {
        if (is_recurring) {
            recurring_transaction_id = await this.recurringTransactionRepository.createRecurringTransacion("expense", name, value, date, due_date);
        }        
        
        const createdExpense = await this.expenseRepository.createExpense(name, value, date, due_date, wallet_id, recurring_transaction_id);
        return createdExpense;
    }
}