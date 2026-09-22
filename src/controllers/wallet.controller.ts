import { Request, Response } from "express";
import { WalletService } from "../services/wallet.service";
import { createWalletRequest, updateWalletRequest } from "../types/Wallet";
import { idParamSchema } from "../types/Params";

export class WalletController {
    constructor(private walletService: WalletService) {}

    getWallets = async (req: Request, res: Response): Promise<Response> => {
        const wallets = await this.walletService.getWallets();
        return res.status(200).json(wallets)
    }

    createWallet = async (req: Request, res: Response): Promise<Response> => {
        const parsed = createWalletRequest.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const createdWallet = await this.walletService.createWallet(parsed.data);
        return res.status(201).json(createdWallet);
    }

    updateWallet = async (req: Request, res: Response): Promise<Response> => {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ errors: parsedParams.error.flatten() });
        }
        const parsed = updateWalletRequest.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const updated = await this.walletService.updateWallet(parsedParams.data.id, parsed.data);
        return res.status(200).json(updated);
    }

    deleteWallet = async (req: Request, res: Response): Promise<Response> => {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return res.status(400).json({ errors: parsedParams.error.flatten() });
        }
        const deleted = await this.walletService.deleteWallet(parsedParams.data.id);
        return res.status(200).json(deleted);
    }
}