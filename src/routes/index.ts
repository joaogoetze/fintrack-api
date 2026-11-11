import { Router } from 'express';
import { expenseRoutes } from './expense.routes';
import { incomeRoutes } from './income.routes';
import { dashboardRoutes } from './dashboard.routes';
import { walletRoutes } from './wallet.routes';
import { categoryRoutes } from './category.routes';
import { recurringTransactionRoutes } from './recurringTransaction.routes';
import { transferRoutes } from './transfer.routes';
import { authRoutes } from './auth.routes';
import { authMiddleware, workspaceMiddleware } from '../middlewares/auth.middleware';

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/expenses", authMiddleware, workspaceMiddleware, expenseRoutes);
routes.use("/incomes", authMiddleware, workspaceMiddleware, incomeRoutes);
routes.use("/dashboard", authMiddleware, workspaceMiddleware, dashboardRoutes);
routes.use("/wallets", authMiddleware, workspaceMiddleware, walletRoutes);
routes.use("/transfers", authMiddleware, workspaceMiddleware, transferRoutes);
routes.use("/categories", authMiddleware, workspaceMiddleware, categoryRoutes);
routes.use("/recurring-transactions", authMiddleware, workspaceMiddleware, recurringTransactionRoutes);


