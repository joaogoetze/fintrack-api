import { Router } from "express";
import { TransferRepository } from "../repository/transfer.repository";
import { TransferService } from "../services/transfer.service";
import { TransferController } from "../controllers/transfer.controller";

export const transferRoutes = Router();

const transferRepository = new TransferRepository();
const transferService = new TransferService(transferRepository);
const transferController = new TransferController(transferService);

transferRoutes.post("/", transferController.createTransfer);
