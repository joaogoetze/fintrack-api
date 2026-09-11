import { WalletRepository } from "../repository/wallet.repository";

export class WalletService {
    constructor(private walletRepository: WalletRepository) {}

    async getWallets() {
        const wallets = await this.walletRepository.getWallets();
        return wallets;
    }

    async createWallet(name: string, value: number) {
        const createdWallet = await this.walletRepository.createWallet(name, value);
        return createdWallet;
    }

    async updateWalletValue(id: number, value: number, operation: string) {
        const updatedWalletValue = await this.walletRepository.updateWalletValue(id, value, operation);
        return updatedWalletValue;
    }

    async updateWalletName(id: number, name: string) {
        return await this.walletRepository.updateWalletName(id, name);
    }

    async updateWallet(id: number, name: string, balance: number) {
        return await this.walletRepository.updateWallet(id, name, balance);
    }

    async softDeleteWallet(id: number) {
        return await this.walletRepository.softDeleteWallet(id);
    }
}