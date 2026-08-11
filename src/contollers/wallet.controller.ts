import { Request, Response } from "express";
import { WalletService } from "../services/wallet.service";

export class WalletController {
    constructor(private walletService: WalletService) {}

    getWallets = async (req: Request, res: Response) => {
        const wallets = await this.walletService.getWallets();
        return res.status(200).json(wallets)
    }

    createWallet = async (req: Request, res: Response) => {
        const { name, value } = req.body 
        const createdWallet = await this.walletService.createWallet(name, value);
        return res.status(201).json(createdWallet);
    }

    updateWalletValue = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const { value, operation } = req.body 
        const updatedWalletValue = await this.walletService.updateWalletValue(id, value, operation);
        return res.status(200).json(updatedWalletValue);
    }
}