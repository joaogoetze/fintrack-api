import { WalletRepository } from "../repository/wallet.repository";
import { CreateWalletInput, UpdateWalletInput, Wallet } from "../types/Wallet";

export class WalletService {
    constructor(private walletRepository: WalletRepository) {}

    async getWallets(): Promise<Wallet[]> {
        return await this.walletRepository.getWallets();
    }

    async createWallet(data: CreateWalletInput): Promise<Wallet> {
        return await this.walletRepository.createWallet(data.name, data.balance);
    }

    async updateWallet(id: number, data: UpdateWalletInput): Promise<Wallet> {
        return await this.walletRepository.updateWallet(id, data.name, data.balance);
    }

    async deleteWallet(id: number): Promise<Wallet> {
        return await this.walletRepository.deleteWallet(id);
    }
}