import { Router } from "express";
import { TransferController } from "../controllers/transfer.controller";
import { TransferService } from "../services/transfer.service";
import { TransferRepository } from "../repository/transfer.repository";

export const transferRoutes = Router();

const transferRepository = new TransferRepository();
const transferService = new TransferService(transferRepository);
const transferController = new TransferController(transferService);

transferRoutes.post("/", transferController.createTransfer);

