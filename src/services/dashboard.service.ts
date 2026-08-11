import { DashboardRepository } from "../repository/dashboard.repository";

export class DashboardService {
    constructor(private dashboardRepository: DashboardRepository) {}

    async getSumary(month: string) {
        const sumary = await this.dashboardRepository.getSumary(month);
        sumary.balance = sumary.total_income - sumary.total_expenses;
        return sumary;
    }
}