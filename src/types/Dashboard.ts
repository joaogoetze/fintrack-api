import { z } from "zod";

export const summarySchema = z.object({
    totalIncome: z.coerce.number(),
    paidIncome: z.coerce.number().default(0),
    unpaidIncome: z.coerce.number().default(0),
    totalExpenses: z.coerce.number(),
    paidExpenses: z.coerce.number().default(0),
    unpaidExpenses: z.coerce.number().default(0),
    balance: z.coerce.number(),
    projectedBalance: z.coerce.number().default(0),
});

export type Summary = z.infer<typeof summarySchema>;

export const dueTransactionSchema = z.object({
    id: z.number(),
    name: z.string(),
    amount: z.coerce.number(),
    date: z.string().date().nullable(),
    dueDate: z.string().date().nullable(),
    walletId: z.number().nullable(),
    walletName: z.string().nullable().optional(),
    recurringTransactionId: z.number().nullable(),
    paid: z.boolean(),
    workspaceId: z.coerce.number().optional(),
    deletedAt: z.coerce.date().nullable().optional(),
    type: z.enum(["income", "expense"]),
});

export type DueTransaction = z.infer<typeof dueTransactionSchema>;
