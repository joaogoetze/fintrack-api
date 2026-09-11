import { Request, Response } from "express";
import { ExpenseService } from "../services/expense.service";
import { ExpenseUpdate } from "../types/expense";

export class ExpenseController {
    constructor(private expensesService: ExpenseService) {}

    getExpenses = async (req: Request, res: Response) => {
        const month = req.params.month as string;
        const expenses = await this.expensesService.getExpenses(month)
        
        return res.status(200).json(expenses);
    }

    createExepense = async (req: Request, res: Response) => {
        console.log("data", req.body);
                 
        const { name, amount, date, due_date, is_recurring, wallet_id } = req.body 
        
        const createdExpense = await this.expensesService.createExpense(name, amount, date, due_date, is_recurring, wallet_id);
        return res.status(201).json(createdExpense);
    }

    updatePaidStatus = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const { paid, wallet_id, amount } = req.body;
        
        try {
            const updatedExpense = await this.expensesService.updatePaidStatus(id, paid, wallet_id, amount);
            return res.status(200).json(updatedExpense);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao atualizar status";
            return res.status(400).json({ message });
        }
    }

    deleteExpense = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        try {
            const deleted = await this.expensesService.softDeleteExpense(id);
            return res.status(200).json(deleted);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao excluir despesa";
            return res.status(400).json({ message });
        }
    }

    updateExpense = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        console.log("re body", req.body);
        
        const { name, amount, date, due_date, wallet_id, update_rec, recurring_transaction_id   } = req.body;
        const teste: ExpenseUpdate = {id, name, amount, date, due_date, wallet_id, update_rec, recurring_transaction_id}
        try {
            const updatedExpense = await this.expensesService.updateExpense(teste);
            return res.status(200).json(updatedExpense);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao editar despesa";
            return res.status(400).json({ message });
        }
    }
}