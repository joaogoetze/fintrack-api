import { z } from "zod";

const recurringTransactionSchema = z.object({
    id: z.number(),
    type: z.string(),
    name: z.string(),
    amount: z.coerce.number(),
    startDate: z.string().date(),
    dueDate: z.string().date().nullable(),
});

export type RecurringTransaction = z.infer<typeof recurringTransactionSchema>;

export const createRecurringTransactionRequest = recurringTransactionSchema.omit({ id: true });

export type CreateRecurringTransactionInput = z.infer<typeof createRecurringTransactionRequest>;

export const updateRecurringTransactionRequest = recurringTransactionSchema.omit({ type: true, startDate: true });

export type UpdateRecurringTransactionInput = z.infer<typeof updateRecurringTransactionRequest>;

export type CreateRecurringTransactionData = {
    type: string;
    name: string;
    amount: number;
    startDate: string;
    dueDate?: string | null;
};

export type UpdateRecurringTransactionData = {
    id: number;
    name: string;
    amount: number;
    dueDate: string | null;
};
