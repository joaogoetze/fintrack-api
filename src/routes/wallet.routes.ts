import { Router } from "express";
import { WalletController } from "../contollers/wallet.controller";
import { WalletService } from "../services/wallet.service";
import { WalletRepository } from "../repository/wallet.repository";

export const walletRoutes = Router();

const walletRepository = new WalletRepository();
const walletService = new WalletService(walletRepository);
const walletController = new WalletController(walletService)

walletRoutes.get("/", walletController.getWallets);
walletRoutes.post("/", walletController.createWallet);
walletRoutes.put("/:id", walletController.updateWalletValue);