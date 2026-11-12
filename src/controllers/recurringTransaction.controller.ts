import { Request, Response } from "express";
import { RecurringTransactionService } from "../services/recurringTransaction.service";
import {
    createRecurringTransactionSchema,
    getRecurringTransactionsQuerySchema,
    updateRecurringTransactionSchema
} from "../types/RecurringTransaction";
import { idParamSchema } from "../types/Params";

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

    createRecurringTransaction = async (req: Request, res: Response): Promise<Response> => {
        const workspaceId = req.workspaceId!;
        const parsed = createRecurringTransactionSchema.safeParse({ ...req.body, workspaceId });
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const created = await this.recurringTransactionService.createRecurringTransaction(parsed.data);
        return res.status(201).json(created);
    };

    updateRecurringTransaction = async (req: Request, res: Response): Promise<Response> => {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ errors: parsedParams.error.flatten() });
        }
        const workspaceId = req.workspaceId!;
        const parsed = updateRecurringTransactionSchema.safeParse({ id: parsedParams.data.id, ...req.body });
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const updated = await this.recurringTransactionService.updateRecurringTransaction(parsed.data, workspaceId);
        return res.status(200).json(updated);
    };

    deleteRecurringTransaction = async (req: Request, res: Response): Promise<Response> => {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ errors: parsedParams.error.flatten() });
        }
        const workspaceId = req.workspaceId!;
        const deleted = await this.recurringTransactionService.deleteRecurringTransaction(parsedParams.data.id, workspaceId);
        return res.status(200).json(deleted);
    };
}
