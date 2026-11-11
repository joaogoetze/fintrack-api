import { Request, Response } from "express";
import { RecurringTransactionService } from "../services/recurringTransaction.service";
import { getRecurringTransactionsQuerySchema } from "../types/RecurringTransaction";

export class RecurringTransactionController {
    constructor(private recurringTransactionService: RecurringTransactionService) {}

    getRecurringTransactions = async (req: Request, res: Response): Promise<Response> => {
        const workspaceId = req.workspaceId!;
        const parsed = getRecurringTransactionsQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const result = await this.recurringTransactionService.getRecurringTransactions(workspaceId, parsed.data.type);
        return res.status(200).json(result);
    };
}

