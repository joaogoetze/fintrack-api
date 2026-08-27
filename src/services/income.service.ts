import { IncomeRepository } from "../repository/income.repository";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";

export class IncomeService {
    constructor(private incomeRepository: IncomeRepository, private recurringTransactionRepository: RecurringTransactionRepository) {}

    async getIncomes(month: string) {
        const incomes = await this.incomeRepository.getIncomes(month);

        const data = month + '-01';
                
        const rt = await this.recurringTransactionRepository.getRecurringTransactionByDate(month, "income");
        
        const transacoesParaCriar = rt.filter((e) => {
            if (incomes.length <= 0 && rt.length > 0) {
                return rt;
            }
            for (const x of incomes) {
                if (e.id != x.recurring_transaction_id) {
                    return e;
                }
            }
        });

        for (const income of transacoesParaCriar) {
            let data_pae = "";
                if (income.due_date) {
                    const day = income.due_date.getDate();
                    data_pae = month + '-' + day;
                    
                }
                const jones = await this.createIncome(income.name, income.amount, data, data_pae, false, undefined, income.id);
                incomes.push(jones);
        }        
        return incomes;
    }

    async createIncome(name: string, value: number, date: string, due_date: string, is_recurring: boolean, wallet_id?: number, recurring_transaction_id?: number) {
        if (is_recurring) {
            recurring_transaction_id = await this.recurringTransactionRepository.createRecurringTransacion("income", name, value, date, due_date);
        }        
        
        const createdIncome = await this.incomeRepository.createIncome(name, value, date, due_date, wallet_id, recurring_transaction_id);
        return createdIncome;
    }
}