import { Router } from "express";
import { RecurringTransactionController } from "../controllers/recurringTransaction.controller";
import { RecurringTransactionService } from "../services/recurringTransaction.service";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";

export const recurringTransactionRoutes = Router();

const recurringTransactionRepository = new RecurringTransactionRepository();
const recurringTransactionService = new RecurringTransactionService(recurringTransactionRepository);
const recurringTransactionController = new RecurringTransactionController(recurringTransactionService);

recurringTransactionRoutes.get("/", recurringTransactionController.getRecurringTransactions);

