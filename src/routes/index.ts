import { Router } from 'express';
import { expenseRoutes } from './expense.routes';
import { incomeRoutes } from './income.routes';
import { dashboardRoutes } from './dashboard.routes';
import { walletRoutes } from './wallet.routes';

export const routes = Router();

routes.use("/expenses", expenseRoutes);
routes.use("/incomes", incomeRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/wallets", walletRoutes);
