import { Router } from "express";
import { DashboardController } from "../contollers/dashboard.controller";
import { DashboardService } from "../services/dashboard.service";
import { DashboardRepository } from "../repository/dashboard.repository";

export const dashboardsRoutes = Router();

const dashboardRepository = new DashboardRepository();
const dashboardService = new DashboardService(dashboardRepository);
const dashboardController = new DashboardController(dashboardService)

dashboardsRoutes.get("/sumary/:month", dashboardController.getSumary);