import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";
import { monthParamSchema } from "../types/Params";

export class DashboardController {
    constructor(private dashboardService: DashboardService) {}

    getSummary = async (req: Request, res: Response): Promise<Response> => {
        const parsed = monthParamSchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const workspaceId = req.workspaceId!;
        const summary = await this.dashboardService.getSummary(parsed.data.month, workspaceId);
        return res.status(200).json(summary);
    }

    getDueTransactions = async (req: Request, res: Response): Promise<Response> => {
        const parsed = monthParamSchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const workspaceId = req.workspaceId!;
        const dueTransactions = await this.dashboardService.getDueTransactions(parsed.data.month, workspaceId);
        return res.status(200).json(dueTransactions);
    }
}