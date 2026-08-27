import { IncomeRepository } from "../repository/income.repository";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import { WalletRepository } from "../repository/wallet.repository";

export class IncomeService {
    constructor(
        private incomeRepository: IncomeRepository, 
        private recurringTransactionRepository: RecurringTransactionRepository,
        private walletRepository: WalletRepository
    ) {}

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

        console.log('INCOMES', incomes);
        console.log("incomes pra criar");
        
        

        for (const income of transacoesParaCriar) {
            let data_pae = "";
                if (income.due_date) {
                    const day = income.due_date.getDate();
                    data_pae = month + '-' + day;
                    
                }
                const jones = await this.createIncome(income.name, income.amount, data, data_pae, false, undefined, income.id, false);
                incomes.push(jones);
        }        
        return incomes;
    }

    async createIncome(name: string, value: number, date: string, due_date: string, is_recurring: boolean, wallet_id?: number, recurring_transaction_id?: number, paide?: boolean) {
        if (is_recurring) {
            recurring_transaction_id = await this.recurringTransactionRepository.createRecurringTransacion("income", name, value, date, due_date);
        }        
        
        // Recurring incomes are created as unpaid (paid=false), normal incomes as paid=true
        const paid = !paide ? paide : !is_recurring;
        
        const createdIncome = await this.incomeRepository.createIncome(name, value, date, due_date, wallet_id, recurring_transaction_id, paid);
        
        // Only update wallet for non-recurring (paid) incomes
        if (wallet_id && paid) {
            await this.walletRepository.updateWalletValue(wallet_id, value, "income");
        }
        
        return createdIncome;
    }

    async updatePaidStatus(id: number, paid: boolean, wallet_id?: number, value?: number) {
        const updatedIncome = await this.incomeRepository.updatePaidStatus(id, paid);
        
        // Adjust wallet when paid status changes
        if (wallet_id && value !== undefined) {
            if (paid) {
                // Marking as paid: add to wallet
                await this.walletRepository.updateWalletValue(wallet_id, value, "income");
            } else {
                // Marking as unpaid: subtract from wallet (reverse)
                await this.walletRepository.updateWalletValue(wallet_id, value, "expense");
            }
        }
        
        return updatedIncome;
    }
}