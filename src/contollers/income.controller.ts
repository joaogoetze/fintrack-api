import { Request, Response } from "express";
import { IncomeService } from "../services/income.service";

export class IncomeController {
    constructor(private incomeService: IncomeService) {}

    getIncomes = async (req: Request, res: Response) => {
        const month = req.params.month as string;
        const incomes = await this.incomeService.getIncomes(month);
        return res.status(200).json(incomes)
    }

    createIncome = async (req: Request, res: Response) => {   
        const { name, value, date, due_date, is_recurring, wallet_id } = req.body 
        const createdIncome = await this.incomeService.createIncome(name, value, date, due_date, is_recurring, wallet_id);
        return res.status(201).json(createdIncome);
    }

    updatePaidStatus = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const { paid, wallet_id, value } = req.body;
        
        try {
            const updatedIncome = await this.incomeService.updatePaidStatus(id, paid, wallet_id, value);
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
        const { name, value, date, due_date, wallet_id } = req.body;
        try {
            const updatedIncome = await this.incomeService.updateIncome(id, name, value, date, due_date, wallet_id);
            return res.status(200).json(updatedIncome);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao editar receita";
            return res.status(400).json({ message });
        }
    }
}