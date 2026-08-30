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
        console.log("Toma no cu");
        
        const updatedWalletValue = await this.walletRepository.updateWalletValue(id, value, operation);
        return updatedWalletValue;
    }

    async softDeleteWallet(id: number) {
        return await this.walletRepository.softDeleteWallet(id);
    }
}