import { z } from "zod";

export const expenseSchema = z.object({
    id: z.number(),
    name: z.string(),
    amount: z.coerce.number(),
    date: z.string().date(),
    walletId: z.number().nullable(),
    walletName: z.string().optional(),
    recurringTransactionId: z.number().nullable(),
    dueDate: z.string().date().nullable(),
    paid: z.boolean(),
    deletedAt: z.coerce.date().nullable(),
});

export type Expense = z.infer<typeof expenseSchema>;

export type ExpenseListItem = Omit<Expense, "date"> & { date: string | null };

export type ExpensesResponse = {
    expenses: ExpenseListItem[];
    total: number;
};

export const createExpenseSchema = expenseSchema
    .omit({ id: true, deletedAt: true, walletName: true })
    .partial({
        walletId: true,
        recurringTransactionId: true,
        dueDate: true,
    });

export const createExpenseOptionsSchema = z.object({
    isRecurring: z.boolean()
});

export const createExpenseRequest = createExpenseSchema.merge(createExpenseOptionsSchema)

export type CreateExpenseInput = z.infer<typeof createExpenseRequest>;

export const updateExpenseSchema = expenseSchema
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

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export type CreateExpenseData = {
    name: string;
    amount: number;
    date: string;
    dueDate?: string | null;
    walletId?: number | null;
    recurringTransactionId?: number | null;
    paid?: boolean;
};

export type UpdateExpenseData = {
    id: number;
    name: string;
    amount: number;
    date: string;
    dueDate: string | null;
    walletId: number | null;
    paid: boolean;
};

export const updateExpensePaidStatusSchema = z.object({
    paid: z.boolean(),
    walletId: z.number().nullable().optional(),
    amount: z.coerce.number().optional()
});

export type UpdateExpensePaidStatusInput = z.infer<typeof updateExpensePaidStatusSchema>;