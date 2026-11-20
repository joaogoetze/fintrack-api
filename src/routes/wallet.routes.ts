import { Router } from "express";
import { WalletRepository } from "../repository/wallet.repository";
import { WalletService } from "../services/wallet.service";
import { WalletController } from "../controllers/wallet.controller";

export const walletRoutes = Router();

const walletRepository = new WalletRepository();
const walletService = new WalletService(walletRepository);
const walletController = new WalletController(walletService);

walletRoutes.get("/", walletController.getWallets);
walletRoutes.post("/", walletController.createWallet);
walletRoutes.put("/:id", walletController.updateWallet);
walletRoutes.delete("/:id", walletController.deleteWallet);
