import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";
import { monthParamSchema } from "../types/Params";

export class DashboardController {
    constructor(private dashboardService: DashboardService) {}

    getSumary = async (req: Request, res: Response): Promise<Response> => {
        const parsed = monthParamSchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const sumary = await this.dashboardService.getSumary(parsed.data.month);
        return res.status(200).json(sumary);
    }

    getDueTransactions = async (req: Request, res: Response): Promise<Response> => {
        const parsed = monthParamSchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const dueTransactions = await this.dashboardService.getDueTransactions(parsed.data.month);
        return res.status(200).json(dueTransactions);
    }
}