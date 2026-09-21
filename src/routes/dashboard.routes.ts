import { Router } from "express";
import { DashboardController } from "../contollers/dashboard.controller";
import { DashboardService } from "../services/dashboard.service";
import { DashboardRepository } from "../repository/dashboard.repository";
import { ExpenseRepository } from "../repository/expense.repository";
import { IncomeRepository } from "../repository/income.repository";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import { WalletRepository } from "../repository/wallet.repository";
import { ExpenseService } from "../services/expense.service";
import { IncomeService } from "../services/income.service";

export const dashboardRoutes = Router();

const dashboardRepository = new DashboardRepository();
const expenseRepository = new ExpenseRepository();
const incomeRepository = new IncomeRepository();
const recurringTransactionRepository = new RecurringTransactionRepository();
const walletRepository = new WalletRepository();
const expenseService = new ExpenseService(expenseRepository, recurringTransactionRepository, walletRepository);
const incomeService = new IncomeService(incomeRepository, recurringTransactionRepository, walletRepository);
const dashboardService = new DashboardService(dashboardRepository, expenseService, incomeService);
const dashboardController = new DashboardController(dashboardService)

dashboardRoutes.get("/summary/:month", dashboardController.getSumary);
dashboardRoutes.get("/dues/:month", dashboardController.getDueExpenses);