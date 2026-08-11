import { Router } from "express";
import { ExpenseController } from "../contollers/expense.controller";
import { ExpenseService } from "../services/expense.service";
import { ExpenseRepository } from "../repository/expense.repository";

export const expensesRoutes = Router();

const expenseRepository = new ExpenseRepository();
const expenseService = new ExpenseService(expenseRepository);
const expenseController = new ExpenseController(expenseService)

expensesRoutes.get("/:month", expenseController.getExpenses);
expensesRoutes.post("/", expenseController.createExepenss);