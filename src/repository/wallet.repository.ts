import 'dotenv/config';
import { pool } from '../database';
import { toCamel, toCamelMany } from '../utils/case';
import { CreateWalletRequest, UpdateWalletRequest, UpdateWalletValueRequest, Wallet } from '../types/Wallet';

export class WalletRepository {

    async getWallets(workspaceId: number): Promise<Wallet[]> {
        const { rows } = await pool.query(`
            SELECT *
            FROM wallets
            WHERE workspace_id = $1 AND deleted_at IS NULL
            ORDER BY id DESC
            `, [workspaceId]
        );
        return toCamelMany(rows);
    }

    async createWallet(data: CreateWalletRequest): Promise<Wallet> {
        const { rows } = await pool.query(`
            INSERT INTO wallets
            (name, balance, workspace_id)
            VALUES ($1, $2, $3)
            RETURNING *
            `, [data.name, data.balance, data.workspaceId]
        );
        return toCamel(rows[0]);
    }

    async updateWalletValue(data: UpdateWalletValueRequest): Promise<Wallet> {
        const operator = data.operation === "expense" ? '-' : '+';

        const { rows } = await pool.query(`
            UPDATE wallets
            SET balance = balance ${operator} $1
            WHERE id = $2
            RETURNING *
            `, [data.balance, data.id]
        );
        return toCamel(rows[0]);
    }

    async updateWallet(data: UpdateWalletRequest): Promise<Wallet> {
        const { rows } = await pool.query(`
            UPDATE wallets
            SET name = $1, balance = $2
            WHERE id = $3
            RETURNING *
            `, [data.name, data.balance, data.id]
        );
        return toCamel(rows[0]);
    }

    async deleteWallet(id: number): Promise<Wallet> {
        const { rows } = await pool.query(`
            UPDATE wallets
            SET deleted_at = now()
            WHERE id = $1
            RETURNING *
            `, [id]
        );
        return toCamel(rows[0]);
    }
}