import { IncomeRepository } from "../repository/income.repository";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import { WalletRepository } from "../repository/wallet.repository";
import { parse, endOfMonth, setDate, format } from "date-fns";
import { CreateIncomeInput, UpdateIncomeInput, Income, IncomesResponse } from "../types/Income";
import { formatDateOnly, withDateOnly } from "../utils/dates";

export class IncomeService {
    constructor(
        private incomeRepository: IncomeRepository,
        private recurringTransactionRepository: RecurringTransactionRepository,
        private walletRepository: WalletRepository
    ) { }

    async getIncomes(month: string): Promise<IncomesResponse> {

        const incomes = await this.incomeRepository.getIncomes(month);
        const baseDate = month + '-01';

        const recurringTransactions = await this.recurringTransactionRepository.getRecurringTransactionByDate(month, "income");

        const transactionsToCreate = recurringTransactions.filter((recurringTx) => {
            return !incomes.some(
                (income) => income.recurringTransactionId === recurringTx.id
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
            const toCreate: CreateIncomeInput = { name: recurringTx.name, amount: recurringTx.amount, date: baseDate, dueDate: formattedDueDate, isRecurring: false, paid: false, recurringTransactionId: recurringTx.id }
            const createdIncome = await this.createIncome(toCreate);
            incomes.push(createdIncome);
        }
        const validIncomes = incomes.filter(i => i.deletedAt === null);
        const total = validIncomes.reduce((sum: number, i) => sum + Number(i.amount), 0);
        const formattedIncomes = validIncomes.map((income) => ({
            id: income.id,
            name: income.name,
            amount: income.amount,
            date: income.date
                ? format(new Date(income.date), "yyyy-MM-dd")
                : null,
            walletId: income.walletId,
            walletName: income.walletName,
            recurringTransactionId: income.recurringTransactionId,
            dueDate: income.dueDate
                ? format(new Date(income.dueDate), "yyyy-MM-dd")
                : null,
            paid: income.paid,
            deletedAt: income.deletedAt,
        }));
        return { incomes: formattedIncomes, total };
    }

    async createIncome(data: CreateIncomeInput): Promise<Income> {
        let { name, amount, date, dueDate, isRecurring, walletId, recurringTransactionId, paid } = data;

        if (isRecurring) {
            recurringTransactionId = await this.recurringTransactionRepository.createRecurringTransacion({ type: "income", name, amount, startDate: date, dueDate });
        }

        const isPaid = Boolean((paid !== undefined ? paid : !isRecurring) && walletId);

        const createdIncome = await this.incomeRepository.createIncome({ name, amount, date, dueDate, walletId, recurringTransactionId, paid: isPaid });

        if (walletId && isPaid) {
            await this.walletRepository.updateWalletValue(walletId, amount, "income");
        }

        return withDateOnly(createdIncome);
    }

    async updateIncome(i: UpdateIncomeInput): Promise<Income> {
        const existing = await this.incomeRepository.getIncomeById(i.id);

        if (!existing) {
            throw new Error("Receita não encontrada");
        }

        if (existing.paid && existing.walletId) {
            await this.walletRepository.updateWalletValue(existing.walletId, Number(existing.amount), "expense");
        }

        const newName = i.name ?? existing.name;
        const newAmount = i.amount ?? existing.amount;
        const newDate = formatDateOnly(i.date ?? existing.date) ?? "";
        const newDueDate = formatDateOnly(i.dueDate !== undefined ? i.dueDate : existing.dueDate);
        const newWalletId = i.walletId !== undefined ? i.walletId : existing.walletId;

        const newPaid = Boolean((i.paid ?? existing.paid) && newWalletId);

        const updatedIncome = await this.incomeRepository.updateIncome({
            id: i.id, name: newName, amount: newAmount, date: newDate, dueDate: newDueDate, walletId: newWalletId, paid: newPaid
        });

        if (newPaid && newWalletId) {
            await this.walletRepository.updateWalletValue(newWalletId, newAmount, "income");
        }

        if (i.updateRecurringTransaction && i.recurringTransactionId) {
            await this.recurringTransactionRepository.updateRecurringTransaction({ id: i.recurringTransactionId, name: newName, amount: newAmount, dueDate: newDueDate })
        }

        return withDateOnly(updatedIncome);
    }

    async updatePaidStatus(id: number, paid: boolean, walletId?: number, value?: number): Promise<Income> {
        const existing = await this.incomeRepository.getIncomeById(id);

        if (!existing) {
            throw new Error("Receita não encontrada");
        }

        if (paid) {
            if (!walletId) {
                throw new Error("walletId é obrigatório ao marcar como pago");
            }
            const updatedIncome = await this.incomeRepository.updatePaidStatus(id, true, walletId);
            await this.walletRepository.updateWalletValue(walletId, value ?? existing.amount, "income");
            return withDateOnly(updatedIncome);
        }

        const storedWalletId = walletId ?? existing.walletId;
        if (storedWalletId) {
            await this.walletRepository.updateWalletValue(storedWalletId, value ?? existing.amount, "expense");
        }
        return withDateOnly(await this.incomeRepository.updatePaidStatus(id, false, null));
    }

    async deleteIncome(id: number): Promise<Income> {
        const existing = await this.incomeRepository.getIncomeById(id);

        if (!existing) {
            throw new Error("Receita não encontrada");
        }

        if (existing.paid && existing.walletId) {
            await this.walletRepository.updateWalletValue(existing.walletId, Number(existing.amount), "expense");
        }

        return withDateOnly(await this.incomeRepository.deleteIncome(id));
    }
}