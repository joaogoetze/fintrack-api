import { TransferRepository } from "../repository/transfer.repository";
import { CreateTransferRequest, Transfer } from "../types/Transfer";

export class TransferService {
    constructor(private transferRepository: TransferRepository) {}

    async createTransfer(data: CreateTransferRequest): Promise<Transfer> {
        return this.transferRepository.createTransfer(data);
    }
}

