import { z } from "zod";

const recurringTransactionSchema = z.object({
    id: z.number(),
    type: z.string(),
    name: z.string(),
    amount: z.coerce.number(),
    startDate: z.string().date(),
    dueDate: z.string().date().nullable(),
});

export const createRecurringTransactionRequest = recurringTransactionSchema.omit({ id: true });

export type CreateRecurringTransactionInput = z.infer<typeof createRecurringTransactionRequest>;

export const updateRecurringTransactionRequest = recurringTransactionSchema.omit({ type: true, startDate: true });

export type UpdateRecurringTransactionInput = z.infer<typeof updateRecurringTransactionRequest>;
