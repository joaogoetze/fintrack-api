import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller";
import { ExpenseService } from "../services/expense.service";
import { ExpenseRepository } from "../repository/expense.repository";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import { WalletRepository } from "../repository/wallet.repository";

export const expenseRoutes = Router();

const expenseRepository = new ExpenseRepository();
const recurringTransactionRepository = new RecurringTransactionRepository();
const walletRepository = new WalletRepository();
const expenseService = new ExpenseService(expenseRepository, recurringTransactionRepository, walletRepository);
const expenseController = new ExpenseController(expenseService)

expenseRoutes.get("/:month", expenseController.getExpenses);
expenseRoutes.post("/", expenseController.createExepense);
expenseRoutes.put("/:id/paid", expenseController.updatePaidStatus);
expenseRoutes.put("/:id", expenseController.updateExpense);
expenseRoutes.delete("/:id", expenseController.deleteExpense);