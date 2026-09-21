import { WalletRepository } from "../repository/wallet.repository";
import { CreateWalletInput, UpdateWalletInput } from "../types/Wallet";

export class WalletService {
    constructor(private walletRepository: WalletRepository) {}

    async getWallets() {
        return await this.walletRepository.getWallets();
    }

    async createWallet(data: CreateWalletInput) {
        return await this.walletRepository.createWallet(data.name, data.balance);
    }

    async updateWallet(id: number, data: UpdateWalletInput) {
        return await this.walletRepository.updateWallet(id, data.name, data.balance);
    }

    async deleteWallet(id: number) {
        return await this.walletRepository.deleteWallet(id);
    }
}