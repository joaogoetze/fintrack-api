import { Router } from "express";
import { IncomeController } from "../contollers/income.controller";
import { IncomeService } from "../services/income.service";
import { IncomeRepository } from "../repository/income.repository";

export const incomeRoutes = Router();

const incomeRepository = new IncomeRepository();
const incomeService = new IncomeService(incomeRepository);
const incomeController = new IncomeController(incomeService)

incomeRoutes.get("/:month", incomeController.getIncomes);
incomeRoutes.post("/", incomeController.createIncome);