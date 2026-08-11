import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";

export class DashboardController {
    constructor(private dashboardService: DashboardService) {}

    getSumary = async (req: Request, res: Response) => {
        const month = req.params.month as string;
        const sumary = await this.dashboardService.getSumary(month);
        console.log('sumary', sumary);
        
        return res.status(200).json(sumary);
    }
}