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
        //console.log("Mes", month);
        
        const incomes = await this.incomeRepository.getIncomes(month);
        //console.log("incomes", incomes);
        
        const data = month + '-01';
        //console.log("Data", data);
        
                
        const rt = await this.recurringTransactionRepository.getRecurringTransactionByDate(month, "income");

        //console.log("Transações recorrentes", rt);
        
        
        const transacoesParaCriar = rt.filter((e) => {
            return !incomes.some(
            (income) => income.recurring_transaction_id === e.id
            );
        });

        //console.log("Transações pra criar", transacoesParaCriar);
        

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
        console.log("Criando income");
        
        if (is_recurring) {
            recurring_transaction_id = await this.recurringTransactionRepository.createRecurringTransacion("income", name, value, date, due_date);
        }        
        
        // Recurring incomes are created as unpaid (paid=false), normal incomes as paid=true
        let paid = false;
        // Recurring expenses are created as unpaid (paid=false), normal expenses as paid=true
        paid = (!paide ? paide : !is_recurring) || false;
        if (!wallet_id) paid = false;

        console.log("paid", paid);
        console.log("wallet", wallet_id);
        
        
        const createdIncome = await this.incomeRepository.createIncome(name, value, date, due_date, wallet_id, recurring_transaction_id, paid);
        
        // Only update wallet for non-recurring (paid) incomes
        if (wallet_id && paid) {
            console.log("Atualizar valor");
            
            await this.walletRepository.updateWalletValue(wallet_id, value, "income");
        }
        
        return createdIncome;
    }

    async updatePaidStatus(id: number, paid: boolean, wallet_id?: number, value?: number) {
       console.log("É aqui o b.o");
        
        const existing = await this.incomeRepository.getIncomeById(id);

        if (paid) {
            // Marking as paid: wallet_id is mandatory
            if (!wallet_id) {
                throw new Error("wallet_id é obrigatório ao marcar como pago");
            }
            const updatedIncome = await this.incomeRepository.updatePaidStatus(id, true, wallet_id);
            await this.walletRepository.updateWalletValue(wallet_id, value ?? existing.amount, "income");
            return updatedIncome;
        }

        // Marking as unpaid: reverse using the stored wallet, then clear wallet_id
        const storedWalletId = wallet_id ?? existing.wallet_id;
        if (storedWalletId) {
            await this.walletRepository.updateWalletValue(storedWalletId, value ?? existing.amount, "expense");
        }
        return await this.incomeRepository.updatePaidStatus(id, false, null);
    }

    async softDeleteIncome(id: number) {
        const existing = await this.incomeRepository.getIncomeById(id);

        if (!existing) {
            throw new Error("Receita não encontrada");
        }

        if (existing.recurring_transaction_id) {
            throw new Error("Receitas recorrentes não podem ser excluídas");
        }

        if (existing.paid && existing.wallet_id) {
            await this.walletRepository.updateWalletValue(existing.wallet_id, Number(existing.amount), "expense");
        }

        return await this.incomeRepository.softDeleteIncome(id);
    }
}