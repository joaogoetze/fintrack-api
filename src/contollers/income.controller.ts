import { Request, Response } from "express";
import { IncomeService } from "../services/income.service";
import { createIncomeRequest, updateIncomeSchema, updateIncomePaidStatusSchema } from "../types/Income";

export class IncomeController {
    constructor(private incomeService: IncomeService) { }

    getIncomes = async (req: Request, res: Response) => {
        const month = req.params.month as string;
        const incomes = await this.incomeService.getIncomes(month);
        return res.status(200).json(incomes)
    }

    createIncome = async (req: Request, res: Response) => {
        const parsed = createIncomeRequest.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const createdIncome = await this.incomeService.createIncome(parsed.data);
        return res.status(201).json(createdIncome);
    }

    updatePaidStatus = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const parsed = updateIncomePaidStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const { paid, walletId, amount } = parsed.data;
        const updatedIncome = await this.incomeService.updatePaidStatus(id, paid, walletId ?? undefined, amount);
        return res.status(200).json(updatedIncome);
    }

    deleteIncome = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const deleted = await this.incomeService.deleteIncome(id);
        return res.status(200).json(deleted);
    }

    updateIncome = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const parsed = updateIncomeSchema.safeParse({ id, ...req.body });
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const updatedIncome = await this.incomeService.updateIncome(parsed.data);
        return res.status(200).json(updatedIncome);
    }
}