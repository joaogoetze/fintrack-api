import { Request, Response } from "express";
import { IncomeService } from "../services/income.service";
import { createIncomeRequest, updateIncomeSchema, updateIncomePaidStatusSchema } from "../types/Income";
import { idParamSchema, monthParamSchema } from "../types/Params";

export class IncomeController {
    constructor(private incomeService: IncomeService) { }

    getIncomes = async (req: Request, res: Response): Promise<Response> => {
        const parsed = monthParamSchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const incomes = await this.incomeService.getIncomes(parsed.data.month);
        return res.status(200).json(incomes)
    }

    createIncome = async (req: Request, res: Response): Promise<Response> => {
        const parsed = createIncomeRequest.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const createdIncome = await this.incomeService.createIncome(parsed.data);
        return res.status(201).json(createdIncome);
    }

    updatePaidStatus = async (req: Request, res: Response): Promise<Response> => {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ errors: parsedParams.error.flatten() });
        }
        const parsed = updateIncomePaidStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const { paid, walletId, amount } = parsed.data;
        const updatedIncome = await this.incomeService.updatePaidStatus(parsedParams.data.id, paid, walletId ?? undefined, amount);
        return res.status(200).json(updatedIncome);
    }

    deleteIncome = async (req: Request, res: Response): Promise<Response> => {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ errors: parsedParams.error.flatten() });
        }
        const deleted = await this.incomeService.deleteIncome(parsedParams.data.id);
        return res.status(200).json(deleted);
    }

    updateIncome = async (req: Request, res: Response): Promise<Response> => {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ errors: parsedParams.error.flatten() });
        }
        const parsed = updateIncomeSchema.safeParse({ id: parsedParams.data.id, ...req.body });
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const updatedIncome = await this.incomeService.updateIncome(parsed.data);
        return res.status(200).json(updatedIncome);
    }
}