import { Request, Response } from "express";
import { ExpenseService } from "../services/expense.service";
import { createExpenseSchema, updateExpenseSchema, updateExpensePaidStatusSchema } from "../types/Expense";
import { idParamSchema, monthParamSchema } from "../types/Params";

export class ExpenseController {
    constructor(private expensesService: ExpenseService) { }

    getExpenses = async (req: Request, res: Response): Promise<Response> => {
        const parsed = monthParamSchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const workspaceId = req.workspaceId!;
        const expenses = await this.expensesService.getExpenses(parsed.data.month, workspaceId);
        return res.status(200).json(expenses);
    }

    createExepense = async (req: Request, res: Response): Promise<Response> => {
        const workspaceId = req.workspaceId!;
        const createdBy = req.user?.id;
        const parsed = createExpenseSchema.safeParse({ ...req.body, workspaceId, createdBy });
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
        const workspaceId = req.workspaceId!;
        const parsed = updateExpenseSchema.safeParse({ id: parsedParams.data.id, ...req.body, workspaceId });
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const updatedExpense = await this.expensesService.updateExpense(parsed.data, workspaceId);
        return res.status(200).json(updatedExpense);
    }

    deleteExpense = async (req: Request, res: Response): Promise<Response> => {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ errors: parsedParams.error.flatten() });
        }
        const workspaceId = req.workspaceId!;
        const deleted = await this.expensesService.deleteExpense(parsedParams.data.id, workspaceId);
        return res.status(200).json(deleted);
    }

    updatePaidStatus = async (req: Request, res: Response): Promise<Response> => {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ errors: parsedParams.error.flatten() });
        }
        const workspaceId = req.workspaceId!;
        const parsed = updateExpensePaidStatusSchema.safeParse({ id: parsedParams.data.id, ...req.body });
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const updatedExpense = await this.expensesService.updatePaidStatus(parsed.data, workspaceId);
        return res.status(200).json(updatedExpense);
    }
}