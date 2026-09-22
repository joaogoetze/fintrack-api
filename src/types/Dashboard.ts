import { z } from "zod";

export const summarySchema = z.object({
    totalIncome: z.coerce.number(),
    totalExpenses: z.coerce.number(),
    balance: z.coerce.number(),
});

export type Summary = z.infer<typeof summarySchema>;

export const dueExpenseSchema = z.object({
    id: z.number(),
    name: z.string(),
    amount: z.coerce.number(),
    date: z.string().date().nullable(),
    dueDate: z.string().date().nullable(),
    walletId: z.number().nullable(),
    walletName: z.string().optional(),
    recurringTransactionId: z.number().nullable(),
    paid: z.boolean(),
    deletedAt: z.coerce.date().nullable().optional(),
});

export type DueExpense = z.infer<typeof dueExpenseSchema>;

export const dueTransactionSchema = dueExpenseSchema.extend({
    type: z.enum(["income", "expense"]),
});

export type DueTransaction = z.infer<typeof dueTransactionSchema>;
