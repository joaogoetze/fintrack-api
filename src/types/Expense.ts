import { z } from "zod";

const expenseSchema = z.object({
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

const expenseItemSchema = expenseSchema
    .extend({ walletName: z.string().nullable().optional() });

const expensesResponseSchema = z.object({
    expenses: z.array(expenseItemSchema),
    total: z.number(),
    totalPaid: z.number().default(0),
    totalUnpaid: z.number().default(0),
});

export const createExpenseSchema = expenseSchema
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

export const updateExpenseSchema = expenseSchema
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


export const updateExpensePaidStatusSchema = expenseSchema
    .pick({
        id: true,
        paid: true,
        walletId: true,
        amount: true,
    })
    .extend({
        date: z.string().date().nullable().optional(),
    });

export type Expense = z.infer<typeof expenseSchema>;
export type ExpenseItem = z.infer<typeof expenseItemSchema>;
export type ExpensesResponse = z.infer<typeof expensesResponseSchema>;
export type CreateExpenseRequest = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseRequest = z.infer<typeof updateExpenseSchema>;
export type UpdateExpensePaidStatusRequest = z.infer<typeof updateExpensePaidStatusSchema>;