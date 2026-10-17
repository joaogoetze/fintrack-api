import { IncomeRepository } from "../repository/income.repository";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import { WalletRepository } from "../repository/wallet.repository";
import { CreateIncomeRequest, UpdateIncomeRequest, Income, IncomeItem, IncomesResponse, UpdateIncomePaidStatusRequest } from "../types/Income";
import { formatDateOnly, withDateOnly } from "../utils/dates";
import { materializeRecurring, toListResponse } from "../utils/transactions";

export class IncomeService {
    constructor(
        private incomeRepository: IncomeRepository,
        private recurringTransactionRepository: RecurringTransactionRepository,
        private walletRepository: WalletRepository
    ) { }

    async getIncomes(month: string, workspaceId: number): Promise<IncomesResponse> {
        const incomes = await this.incomeRepository.getIncomes(month, workspaceId);
        await materializeRecurring({
            month,
            type: "income",
            workspaceId,
            existing: incomes,
            listRecurring: (m, t, wsId) => this.recurringTransactionRepository.getRecurringTransactionByDate(m, t, wsId),
            create: (data) => this.createIncome(data),
        });
        const { items, total, totalPaid, totalUnpaid } = toListResponse<IncomeItem>(incomes);
        return { incomes: items, total, totalPaid, totalUnpaid };
    }

    async createIncome(data: CreateIncomeRequest): Promise<Income> {
        let { name, amount, date, dueDate, isRecurring, walletId, recurringTransactionId, paid, workspaceId, createdBy } = data;

        if (isRecurring) {
            const startDate = date || dueDate || `${new Date().toISOString().slice(0, 10)}`;
            recurringTransactionId = await this.recurringTransactionRepository.createRecurringTransacion({
                type: "income",
                name,
                amount,
                startDate,
                dueDate,
                workspaceId
            });
        }

        const isPaid = Boolean((paid !== undefined ? paid : !isRecurring) && walletId);

        const createdIncome = await this.incomeRepository.createIncome({
            name,
            amount,
            date: date || null,
            dueDate: dueDate || null,
            walletId: walletId || null,
            recurringTransactionId: recurringTransactionId || null,
            paid: isPaid,
            workspaceId,
            createdBy: createdBy || null
        });

        if (walletId && isPaid) {
            await this.walletRepository.updateWalletValue({
                id: walletId, 
                balance: amount, 
                operation: "income"
            });
        }

        return withDateOnly(createdIncome);
    }

    async updateIncome(i: UpdateIncomeRequest, workspaceId: number): Promise<Income> {
        const existing = await this.incomeRepository.getIncomeById(i.id, workspaceId);

        if (!existing) {
            throw new Error("Receita não encontrada");
        }

        if (existing.paid && existing.walletId) {
            await this.walletRepository.updateWalletValue({
                id: existing.walletId, 
                balance: existing.amount, 
                operation: "expense"
            });
        }

        const newName = i.name ?? existing.name;
        const newAmount = i.amount ?? existing.amount;
        const newDate = formatDateOnly(i.date !== undefined ? i.date : existing.date);
        const newDueDate = formatDateOnly(i.dueDate !== undefined ? i.dueDate : existing.dueDate);
        const newWalletId = i.walletId !== undefined ? i.walletId : existing.walletId;

        const newPaid = Boolean((i.paid ?? existing.paid) && newWalletId);

        const updatedIncome = await this.incomeRepository.updateIncome({
            id: i.id, 
            name: newName, 
            amount: newAmount, 
            date: newDate, 
            dueDate: newDueDate, 
            walletId: newWalletId, 
            paid: newPaid,
            workspaceId
        });

        if (newPaid && newWalletId) {
            await this.walletRepository.updateWalletValue({
                id: newWalletId, 
                balance: newAmount, 
                operation: "income"
            });
        }

        if (i.updateRecurringTransaction && i.recurringTransactionId) {
            await this.recurringTransactionRepository.updateRecurringTransaction({ 
                id: i.recurringTransactionId, 
                name: newName, 
                amount: newAmount, 
                dueDate: newDueDate 
            });
        }

        return withDateOnly(updatedIncome);
    }

    async updatePaidStatus(data: UpdateIncomePaidStatusRequest, workspaceId: number): Promise<Income> {
        const { id, paid, walletId, amount, date } = data;
        const existing = await this.incomeRepository.getIncomeById(id, workspaceId);

        if (!existing) {
            throw new Error("Receita não encontrada");
        }

        if (paid) {
            if (!walletId) {
                throw new Error("walletId é obrigatório ao marcar como pago");
            }
            const updatedIncome = await this.incomeRepository.updatePaidStatus(id, true, walletId, date);
            await this.walletRepository.updateWalletValue({
                id: walletId, 
                balance: amount ?? existing.amount, 
                operation: "income"
            });
            return withDateOnly(updatedIncome);
        }

        const storedWalletId = walletId ?? existing.walletId;
        if (storedWalletId) {
            await this.walletRepository.updateWalletValue({
                id: storedWalletId, 
                balance: amount ?? existing.amount, 
                operation: "expense"
            });
        }
        return withDateOnly(await this.incomeRepository.updatePaidStatus(id, false, null));
    }

    async deleteIncome(id: number, workspaceId: number): Promise<Income> {
        const existing = await this.incomeRepository.getIncomeById(id, workspaceId);

        if (!existing) {
            throw new Error("Receita não encontrada");
        }

        if (existing.paid && existing.walletId) {
            await this.walletRepository.updateWalletValue({
                id: existing.walletId, 
                balance: existing.amount, 
                operation: "expense"
            });
        }

        return withDateOnly(await this.incomeRepository.deleteIncome(id));
    }
}