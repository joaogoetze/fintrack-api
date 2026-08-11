import { Router } from 'express';
import { expensesRoutes } from './expense.routes';
import { incomeRoutes } from './income.routes';
import { dashboardsRoutes } from './dashboard.routes';
import { walletRoutes } from './wallet.routes';

export const routes = Router();

routes.use("/expenses", expensesRoutes);
routes.use("/incomes", incomeRoutes);
routes.use("/dashboard", dashboardsRoutes);
routes.use("/wallets", walletRoutes);
