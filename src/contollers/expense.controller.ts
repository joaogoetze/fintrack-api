import { Request, Response } from "express";
import { ExpenseService } from "../services/expense.service";
import { createExpenseRequest, updateExpenseSchema, updateExpensePaidStatusSchema } from "../types/Expense";

export class ExpenseController {
    constructor(private expensesService: ExpenseService) { }

    getExpenses = async (req: Request, res: Response) => {
        const month = req.params.month as string;
        const expenses = await this.expensesService.getExpenses(month)
        return res.status(200).json(expenses);
    }

    createExepense = async (req: Request, res: Response) => {
        const parsed = createExpenseRequest.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const data = parsed.data;
        const createdExpense = await this.expensesService.createExpense(data);
        return res.status(201).json(createdExpense);
    }

    updateExpense = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const parsed = updateExpenseSchema.safeParse({ id, ...req.body });
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const updatedExpense = await this.expensesService.updateExpense(parsed.data);
        return res.status(200).json(updatedExpense);
    }

    deleteExpense = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const deleted = await this.expensesService.deleteExpense(id);
        return res.status(200).json(deleted);
    }

    updatePaidStatus = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const parsed = updateExpensePaidStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const { paid, walletId, amount } = parsed.data;
        const updatedExpense = await this.expensesService.updatePaidStatus(id, paid, walletId ?? undefined, amount);
        return res.status(200).json(updatedExpense);
    }
}