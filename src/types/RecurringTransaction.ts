import { z } from "zod";

const recurringTransactionSchema = z.object({
    id: z.number(),
    workspaceId: z.coerce.number(),
    type: z.enum(["income", "expense"]),
    name: z.string(),
    amount: z.coerce.number(),
    startDate: z.string().date(),
    dueDate: z.string().date().nullable(),
});

export const createRecurringTransactionSchema = recurringTransactionSchema
    .omit({ id: true })
    .partial({ dueDate: true });

export const updateRecurringTransactionSchema = recurringTransactionSchema
    .omit({ type: true, startDate: true })
    .partial({ workspaceId: true });

export type RecurringTransaction = z.infer<typeof recurringTransactionSchema>;
export type CreateRecurringTransactionInput = z.infer<typeof createRecurringTransactionSchema>;
export type UpdateRecurringTransactionInput = z.infer<typeof updateRecurringTransactionSchema>;
