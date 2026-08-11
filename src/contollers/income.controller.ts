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
        const { name, value, date, is_recurring, wallet_id } = req.body 
        const createdIncome = await this.incomeService.createIncome(name, value, date, is_recurring, wallet_id);
        return res.status(201).json(createdIncome);
    }
}