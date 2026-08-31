import 'dotenv/config';
import { pool } from '../database';

export class WalletRepository {
    async getWallets() {
        const { rows } = await pool.query(`
            SELECT *
            FROM wallets
            WHERE deleted_at IS NULL
            `
        );
        return rows;
    }
    async createWallet(name: string, value: number) {
        const { rows } = await pool.query(`
            INSERT INTO wallets
            (name, balance)
            VALUES ($1, $2)
            RETURNING *
            `, [name, value]
        );
        return rows;
    }
    async updateWalletValue(id: number, value: number, operation: string) {
        const operator = operation === "expense" ? '-' : '+';
        
        const { rows } = await pool.query(`
            UPDATE wallets
            SET balance = balance ${operator} $1
            WHERE id = $2
            RETURNING *
            `, [value, id]
        );
        return rows[0];
    }
    async updateWalletName(id: number, name: string) {
        const { rows } = await pool.query(`
            UPDATE wallets
            SET name = $1
            WHERE id = $2
            RETURNING *
            `, [name, id]
        );
        return rows[0];
    }
    async updateWallet(id: number, name: string, value: number) {
        const { rows } = await pool.query(`
            UPDATE wallets
            SET name = $1, balance = $2
            WHERE id = $3
            RETURNING *
            `, [name, value, id]
        );
        return rows[0];
    }
    async softDeleteWallet(id: number) {
        const { rows } = await pool.query(`
            UPDATE wallets
            SET deleted_at = now()
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING *
            `, [id]
        );
        return rows[0];
    }
}