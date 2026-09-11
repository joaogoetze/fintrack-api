import { Request, Response } from "express";
import { IncomeService } from "../services/income.service";
import { IncomeUpdate } from "../types/income";

export class IncomeController {
    constructor(private incomeService: IncomeService) {}

    getIncomes = async (req: Request, res: Response) => {
        const month = req.params.month as string;
        const incomes = await this.incomeService.getIncomes(month);
        return res.status(200).json(incomes)
    }

    createIncome = async (req: Request, res: Response) => {   
        const { name, amount, date, due_date, is_recurring, wallet_id } = req.body 
        const createdIncome = await this.incomeService.createIncome(name, amount, date, due_date, is_recurring, wallet_id);
        return res.status(201).json(createdIncome);
    }

    updatePaidStatus = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const { paid, wallet_id, amount } = req.body;
        
        try {
            const updatedIncome = await this.incomeService.updatePaidStatus(id, paid, wallet_id, amount);
            return res.status(200).json(updatedIncome);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao atualizar status";
            return res.status(400).json({ message });
        }
    }

    deleteIncome = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        try {
            const deleted = await this.incomeService.softDeleteIncome(id);
            return res.status(200).json(deleted);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao excluir receita";
            return res.status(400).json({ message });
        }
    }

    updateIncome = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const { name, amount, date, due_date, wallet_id, update_rec, recurring_transaction_id   } = req.body;
        const teste: IncomeUpdate = {id, name, amount, date, due_date, wallet_id, update_rec, recurring_transaction_id}
        try {
            const updatedIncome = await this.incomeService.updateIncome(teste);
            return res.status(200).json(updatedIncome);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao editar receita";
            return res.status(400).json({ message });
        }
    }
}