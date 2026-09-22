import { z } from "zod";

export const incomeSchema = z.object({
    id: z.number(),
    name: z.string(),
    amount: z.coerce.number(),
    date: z.string().date(),
    dueDate: z.string().date().nullable(),
    walletId: z.number().nullable(),
    walletName: z.string().optional(),
    recurringTransactionId: z.number().nullable(),
    paid: z.boolean(),
    deletedAt: z.coerce.date().nullable(),
});

export type Income = z.infer<typeof incomeSchema>;

export type IncomeListItem = Omit<Income, "date"> & { date: string | null };

export type IncomesResponse = {
    incomes: IncomeListItem[];
    total: number;
};

export const createIncomeSchema = incomeSchema
    .omit({ id: true, deletedAt: true, walletName: true })
    .partial({
        walletId: true,
        recurringTransactionId: true,
        dueDate: true,
        paid: true
    });

export const createIncomeOptionsSchema = z.object({
    isRecurring: z.boolean().optional()
});

export const createIncomeRequest = createIncomeSchema.merge(createIncomeOptionsSchema);

export type CreateIncomeInput = z.infer<typeof createIncomeRequest>;

export const updateIncomeSchema = incomeSchema
    .omit({ deletedAt: true, walletName: true })
    .partial({
        name: true,
        amount: true,
        date: true,
        dueDate: true,
        walletId: true,
        recurringTransactionId: true,
        paid: true,
    })
    .extend({
        updateRecurringTransaction: z.boolean().optional()
    });

export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;

export type CreateIncomeData = {
    name: string;
    amount: number;
    date: string;
    dueDate?: string | null;
    walletId?: number | null;
    recurringTransactionId?: number | null;
    paid?: boolean;
};

export type UpdateIncomeData = {
    id: number;
    name: string;
    amount: number;
    date: string;
    dueDate: string | null;
    walletId: number | null;
    paid: boolean;
};

export const updateIncomePaidStatusSchema = z.object({
    paid: z.boolean(),
    walletId: z.number().nullable().optional(),
    amount: z.coerce.number().optional()
});

export type UpdateIncomePaidStatusInput = z.infer<typeof updateIncomePaidStatusSchema>;