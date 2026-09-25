import 'dotenv/config';
import { pool } from '../database';
import { toCamel, toCamelMany } from '../utils/case';
import { Wallet, WalletOperation } from '../types/Wallet';

export class WalletRepository {

    async getWallets(): Promise<Wallet[]> {
        const { rows } = await pool.query(`
            SELECT *
            FROM wallets
            WHERE deleted_at IS NULL
            ORDER BY id
            `
        );
        return toCamelMany(rows);
    }

    async createWallet(name: string, value: number): Promise<Wallet> {
        const { rows } = await pool.query(`
            INSERT INTO wallets
            (name, balance)
            VALUES ($1, $2)
            RETURNING *
            `, [name, value]
        );
        return toCamel(rows[0]);
    }

    async updateWalletValue(id: number, value: number, operation: WalletOperation): Promise<Wallet> {
        const operator = operation === "expense" ? '-' : '+';

        const { rows } = await pool.query(`
            UPDATE wallets
            SET balance = balance ${operator} $1
            WHERE id = $2
            RETURNING *
            `, [value, id]
        );
        return toCamel(rows[0]);
    }

    async updateWallet(id: number, name: string, balance: number): Promise<Wallet> {
        const { rows } = await pool.query(`
            UPDATE wallets
            SET name = $1, balance = $2
            WHERE id = $3
            RETURNING *
            `, [name, balance, id]
        );
        return toCamel(rows[0]);
    }

    async deleteWallet(id: number): Promise<Wallet> {
        const { rows } = await pool.query(`
            UPDATE wallets
            SET deleted_at = now()
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING *
            `, [id]
        );
        return toCamel(rows[0]);
    }
}