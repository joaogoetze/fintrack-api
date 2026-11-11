import { Request, Response } from "express";
import { TransferService } from "../services/transfer.service";
import { createTransferSchema } from "../types/Transfer";

export class TransferController {
    constructor(private transferService: TransferService) {}

    createTransfer = async (req: Request, res: Response): Promise<Response> => {
        const workspaceId = req.workspaceId!;
        const parsed = createTransferSchema.safeParse({ ...req.body, workspaceId });
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const createdTransfer = await this.transferService.createTransfer(parsed.data);
        return res.status(201).json(createdTransfer);
    };
}

