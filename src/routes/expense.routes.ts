import { Router } from "express";
import { ExpenseController } from "../contollers/expense.controller";
import { ExpenseService } from "../services/expense.service";
import { ExpenseRepository } from "../repository/expense.repository";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import { WalletRepository } from "../repository/wallet.repository";

export const expensesRoutes = Router();

const expenseRepository = new ExpenseRepository();
const recurringTransactionRepository = new RecurringTransactionRepository();
const walletRepository = new WalletRepository();
const expenseService = new ExpenseService(expenseRepository, recurringTransactionRepository, walletRepository);
const expenseController = new ExpenseController(expenseService)

expensesRoutes.get("/:month", expenseController.getExpenses);
expensesRoutes.post("/", expenseController.createExepense);
expensesRoutes.put("/:id/paid", expenseController.updatePaidStatus);