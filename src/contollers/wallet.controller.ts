import { Request, Response } from "express";
import { WalletService } from "../services/wallet.service";
import { createWalletRequest, updateWalletRequest } from "../types/Wallet";

export class WalletController {
    constructor(private walletService: WalletService) {}

    getWallets = async (req: Request, res: Response) => {
        const wallets = await this.walletService.getWallets();
        return res.status(200).json(wallets)
    }

    createWallet = async (req: Request, res: Response) => {
        const parsed = createWalletRequest.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const createdWallet = await this.walletService.createWallet(parsed.data);
        return res.status(201).json(createdWallet);
    }

    updateWallet = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const parsed = updateWalletRequest.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const updated = await this.walletService.updateWallet(id, parsed.data);
        return res.status(200).json(updated);
    }

    deleteWallet = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const deleted = await this.walletService.deleteWallet(id);
        return res.status(200).json(deleted);
    }
}