import { WalletRepository } from "../repository/wallet.repository";
import { CreateWalletRequest, UpdateWalletRequest, Wallet, WalletsResponse } from "../types/Wallet";

export class WalletService {
    constructor(private walletRepository: WalletRepository) {}

    async getWallets(workspaceId: number): Promise<WalletsResponse> {
        const wallets = await this.walletRepository.getWallets(workspaceId);
        const total = wallets.reduce((sum: number, row) => sum + Number(row.balance), 0);
        return { wallets, total };
    }

    async createWallet(data: CreateWalletRequest): Promise<Wallet> {
        return await this.walletRepository.createWallet(data);
    }

    async updateWallet(data: UpdateWalletRequest): Promise<Wallet> {
        return await this.walletRepository.updateWallet(data);
    }

    async deleteWallet(id: number): Promise<Wallet> {
        return await this.walletRepository.deleteWallet(id);
    }
}