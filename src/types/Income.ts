import { z } from "zod";

const incomeSchema = z.object({
    id: z.number(),
    name: z.string(),
    amount: z.coerce.number(),
    date: z.string().date(),
    dueDate: z.string().date().nullable(),
    walletId: z.number().nullable(),
    recurringTransactionId: z.number().nullable(),
    paid: z.boolean(),
    deletedAt: z.coerce.date().nullable(),
});

export const createIncomeSchema = incomeSchema
    .omit({ id: true, deletedAt: true })
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
    .omit({ deletedAt: true })
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

export const updateIncomePaidStatusSchema = z.object({
    paid: z.boolean(),
    walletId: z.number().nullable().optional(),
    amount: z.coerce.number().optional()
});

export type UpdateIncomePaidStatusInput = z.infer<typeof updateIncomePaidStatusSchema>;