import { Router } from "express";
import { ExpenseRepository } from "../repository/expense.repository";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import { WalletRepository } from "../repository/wallet.repository";
import { ExpenseService } from "../services/expense.service";
import { ExpenseController } from "../controllers/expense.controller";

export const expenseRoutes = Router();

const expenseRepository = new ExpenseRepository();
const recurringTransactionRepository = new RecurringTransactionRepository();
const walletRepository = new WalletRepository();
const expenseService = new ExpenseService(expenseRepository, recurringTransactionRepository, walletRepository);
const expenseController = new ExpenseController(expenseService);

expenseRoutes.get("/:month", expenseController.getExpenses);
expenseRoutes.post("/", expenseController.createExpense);
expenseRoutes.put("/:id/paid", expenseController.updatePaidStatus);
expenseRoutes.put("/:id", expenseController.updateExpense);
expenseRoutes.delete("/:id", expenseController.deleteExpense);
