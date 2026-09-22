import { Request, Response } from "express";
import { ExpenseService } from "../services/expense.service";
import { createExpenseRequest, updateExpenseSchema, updateExpensePaidStatusSchema } from "../types/Expense";
import { idParamSchema, monthParamSchema } from "../types/Params";

export class ExpenseController {
    constructor(private expensesService: ExpenseService) { }

    getExpenses = async (req: Request, res: Response): Promise<Response> => {
        const parsed = monthParamSchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const expenses = await this.expensesService.getExpenses(parsed.data.month)
        return res.status(200).json(expenses);
    }

    createExepense = async (req: Request, res: Response): Promise<Response> => {
        const parsed = createExpenseRequest.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const data = parsed.data;
        const createdExpense = await this.expensesService.createExpense(data);
        return res.status(201).json(createdExpense);
    }

    updateExpense = async (req: Request, res: Response): Promise<Response> => {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ errors: parsedParams.error.flatten() });
        }
        const parsed = updateExpenseSchema.safeParse({ id: parsedParams.data.id, ...req.body });
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const updatedExpense = await this.expensesService.updateExpense(parsed.data);
        return res.status(200).json(updatedExpense);
    }

    deleteExpense = async (req: Request, res: Response): Promise<Response> => {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ errors: parsedParams.error.flatten() });
        }
        const deleted = await this.expensesService.deleteExpense(parsedParams.data.id);
        return res.status(200).json(deleted);
    }

    updatePaidStatus = async (req: Request, res: Response): Promise<Response> => {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ errors: parsedParams.error.flatten() });
        }
        const parsed = updateExpensePaidStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const { paid, walletId, amount } = parsed.data;
        const updatedExpense = await this.expensesService.updatePaidStatus(parsedParams.data.id, paid, walletId ?? undefined, amount);
        return res.status(200).json(updatedExpense);
    }
}