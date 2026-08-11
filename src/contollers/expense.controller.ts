import { Request, Response } from "express";
import { ExpenseService } from "../services/expense.service";

export class ExpenseController {
    constructor(private expensesService: ExpenseService) {}

    getExpenses = async (req: Request, res: Response) => {
        const month = req.params.month as string;
        const expenses = await this.expensesService.getExpenses(month);
        return res.status(200).json(expenses)
    }

    createExepenss = async (req: Request, res: Response) => {        
        const { name, value, date, is_recurring, wallet_id } = req.body 
        const createdExpense = await this.expensesService.createExpense(name, value, date, is_recurring, wallet_id);
        return res.status(201).json(createdExpense);
    }
}