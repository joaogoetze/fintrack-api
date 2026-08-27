import { Router } from "express";
import { IncomeController } from "../contollers/income.controller";
import { IncomeService } from "../services/income.service";
import { IncomeRepository } from "../repository/income.repository";
import { RecurringTransactionRepository } from "../repository/recurringTransaction.repository";
import { WalletRepository } from "../repository/wallet.repository";

export const incomeRoutes = Router();

const incomeRepository = new IncomeRepository();
const recurringTransactionRepository = new RecurringTransactionRepository();
const walletRepository = new WalletRepository();
const incomeService = new IncomeService(incomeRepository, recurringTransactionRepository, walletRepository);
const incomeController = new IncomeController(incomeService)

incomeRoutes.get("/:month", incomeController.getIncomes);
incomeRoutes.post("/", incomeController.createIncome);
incomeRoutes.put("/:id/paid", incomeController.updatePaidStatus);