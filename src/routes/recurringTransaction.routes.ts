import { Router } from "express";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import { RecurringTransactionService } from "../services/recurringTransaction.service";
import { RecurringTransactionController } from "../controllers/recurringTransaction.controller";

export const recurringTransactionRoutes = Router();

const recurringTransactionRepository = new RecurringTransactionRepository();
const recurringTransactionService = new RecurringTransactionService(recurringTransactionRepository);
const recurringTransactionController = new RecurringTransactionController(recurringTransactionService);

recurringTransactionRoutes.get("/", recurringTransactionController.getRecurringTransactions);
recurringTransactionRoutes.post("/", recurringTransactionController.createRecurringTransaction);
recurringTransactionRoutes.put("/:id", recurringTransactionController.updateRecurringTransaction);
recurringTransactionRoutes.delete("/:id", recurringTransactionController.deleteRecurringTransaction);
