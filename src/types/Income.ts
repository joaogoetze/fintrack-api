import { z } from "zod";

const incomeSchema = z.object({
    id: z.number(),
    name: z.string(),
    amount: z.coerce.number(),
    date: z.string().date().nullable(),
    walletId: z.number().nullable(),
    recurringTransactionId: z.number().nullable(),
    dueDate: z.string().date().nullable(),
    paid: z.boolean(),
    workspaceId: z.coerce.number(),
    createdBy: z.number().nullable().optional(),
    deletedAt: z.coerce.date().nullable(),
});

const incomeItemSchema = incomeSchema
    .extend({ walletName: z.string().nullable().optional() });

const incomesResponseSchema = z.object({
    incomes: z.array(incomeItemSchema),
    total: z.number(),
    totalPaid: z.number().default(0),
    totalUnpaid: z.number().default(0),
});

export const createIncomeSchema = incomeSchema
    .omit({ 
        id: true, 
        deletedAt: true 
    })
    .partial({
        date: true,
        recurringTransactionId: true,
        dueDate: true,
        walletId: true,
        createdBy: true,
    })
    .extend({
        isRecurring: z.boolean().optional(),
        paid: z.boolean().optional()
    });

export const updateIncomeSchema = incomeSchema
    .omit({ deletedAt: true })
    .partial({
        name: true,
        amount: true,
        date: true,
        dueDate: true,
        walletId: true,
        recurringTransactionId: true,
        workspaceId: true,
        createdBy: true,
        paid: true,
    })
    .extend({
        id: z.number(),
        updateRecurringTransaction: z.boolean().optional()
    });


export const updateIncomePaidStatusSchema = incomeSchema
    .pick({
        id: true,
        paid: true,
        walletId: true,
        amount: true,
    })
    .extend({
        date: z.string().date().nullable().optional(),
    });

export type Income = z.infer<typeof incomeSchema>;
export type IncomeItem = z.infer<typeof incomeItemSchema>;
export type IncomesResponse = z.infer<typeof incomesResponseSchema>;
export type CreateIncomeRequest = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeRequest = z.infer<typeof updateIncomeSchema>;
export type UpdateIncomePaidStatusRequest = z.infer<typeof updateIncomePaidStatusSchema>;