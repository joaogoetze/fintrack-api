import { z } from "zod";

const recurringTransactionSchema = z.object({
    id: z.number(),
    workspaceId: z.coerce.number(),
    type: z.enum(["income", "expense"]),
    name: z.string(),
    amount: z.coerce.number(),
    startDate: z.string().date(),
    dueDate: z.string().date().nullable(),
    categoryId: z.number().nullable().optional(),
});

export const recurringTransactionItemSchema = z.object({
    id: z.number(),
    workspaceId: z.coerce.number(),
    type: z.enum(["income", "expense"]),
    name: z.string(),
    amount: z.coerce.number(),
    startDate: z.string().nullable(),
    dueDate: z.string().nullable(),
    categoryId: z.number().nullable().optional(),
    categoryName: z.string().nullable().optional(),
});

export const getRecurringTransactionsQuerySchema = z.object({
    type: z.enum(["income", "expense"]).optional(),
});

export const createRecurringTransactionSchema = recurringTransactionSchema
    .omit({ id: true })
    .partial({ dueDate: true, categoryId: true });

export const updateRecurringTransactionSchema = recurringTransactionSchema
    .omit({ type: true, startDate: true })
    .partial({ workspaceId: true, categoryId: true });

export type RecurringTransaction = z.infer<typeof recurringTransactionSchema>;
export type RecurringTransactionItem = z.infer<typeof recurringTransactionItemSchema>;
export type CreateRecurringTransactionInput = z.infer<typeof createRecurringTransactionSchema>;
export type UpdateRecurringTransactionInput = z.infer<typeof updateRecurringTransactionSchema>;

export type RecurringTransactionsResponse = {
    recurringTransactions: RecurringTransactionItem[];
    total: number;
    totalIncomes: number;
    totalExpenses: number;
    balance: number;
};
