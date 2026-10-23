import { parse, endOfMonth, setDate, format } from "date-fns";
import { formatDateOnly } from "./dates";
import { RecurringTransaction } from "../types/RecurringTransaction";

export type MaterializeInput = {
    name: string;
    amount: number;
    date?: string | null;
    dueDate: string;
    isRecurring: false;
    paid: boolean;
    workspaceId: number;
    walletId?: number | null;
    recurringTransactionId?: number | null;
};

type ExistingTx = {
    recurringTransactionId?: number | null;
};

/**
 * Materializa as transações recorrentes do mês: cria incomes/expenses
 * a partir das recorrentes sem vínculo, ajustando o dueDate para o
 * último dia do mês quando necessário.
 */
export async function materializeRecurring<T extends ExistingTx>(args: {
    month: string;
    type: "income" | "expense";
    workspaceId: number;
    existing: T[];
    listRecurring: (month: string, type: "income" | "expense", workspaceId: number) => Promise<RecurringTransaction[]>;
    create: (data: MaterializeInput) => Promise<T>;
}): Promise<void> {
    const { month, type, workspaceId, existing, listRecurring, create } = args;

    const recurring = await listRecurring(month, type, workspaceId);
    const missing = recurring.filter(
        (recurringTx) => !existing.some((item) => item.recurringTransactionId === recurringTx.id)
    );

    for (const recurringTx of missing) {
        let dueDate = "";
        if (recurringTx.dueDate) {
            const targetMonthDate = parse(month, "yyyy-MM", new Date());
            const lastDay = endOfMonth(targetMonthDate).getDate();
            const sourceDay = typeof recurringTx.dueDate === "string"
                ? parseInt(recurringTx.dueDate.slice(8, 10), 10)
                : new Date(recurringTx.dueDate).getDate();
            dueDate = format(setDate(targetMonthDate, Math.min(sourceDay, lastDay)), "yyyy-MM-dd");
        }
        const created = await create({
            name: recurringTx.name,
            amount: recurringTx.amount,
            date: null,
            dueDate,
            isRecurring: false,
            paid: false,
            workspaceId,
            recurringTransactionId: recurringTx.id,
        });
        existing.push(created);
    }
}

/**
 * Normaliza a lista do mês para o contrato da API: filtra soft-deleted,
 * calcula o total e formata date/dueDate como 'yyyy-MM-dd' sem conversão
 * de timezone (formatDateOnly, nunca `format(new Date(str))`).
 */
export function toListResponse<T>(rows: Record<string, any>[]): { items: T[]; total: number; totalPaid: number; totalUnpaid: number } {
    const valid = rows.filter((row) => row.deletedAt === null);
    const total = valid.reduce((sum: number, row) => sum + Number(row.amount), 0);
    const totalPaid = valid.filter((row) => Boolean(row.paid)).reduce((sum: number, row) => sum + Number(row.amount), 0);
    const totalUnpaid = valid.filter((row) => !row.paid).reduce((sum: number, row) => sum + Number(row.amount), 0);
    const items = valid.map((row) => ({
        id: row.id,
        name: row.name,
        amount: row.amount,
        date: formatDateOnly(row.date),
        walletId: row.walletId,
        walletName: row.walletName,
        recurringTransactionId: row.recurringTransactionId,
        dueDate: formatDateOnly(row.dueDate),
        paid: row.paid,
        workspaceId: row.workspaceId,
        deletedAt: row.deletedAt,
    }));
    return { items: items as T[], total, totalPaid, totalUnpaid };
}
