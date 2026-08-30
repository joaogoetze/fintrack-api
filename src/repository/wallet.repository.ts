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
        console.log("atualizando valor");
        
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