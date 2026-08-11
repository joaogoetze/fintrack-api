import 'dotenv/config';
import { pool } from '../database';

export class WalletRepository {
    async getWallets() {
        const { rows } = await pool.query(`
            SELECT *
            FROM wallets
            `
        );
        return rows;
    }
    async createWallet(name: string, value: number) {
        const { rows } = await pool.query(`
            INSERT INTO wallets
            (name, value)
            VALUES ($1, $2)
            RETURNING *
            `, [name, value]
        );
        return rows;
    }
    async updateWalletValue(id: number, value: number, operation: string) {
        const operator = operation === "expense" ? '-' : '+';

        console.log("id", id, "value", value, "operator", operator);
        

        const { rows } = await pool.query(`
            UPDATE wallets
            SET balance = balance ${operator} $1
            WHERE id = $2
            RETURNING *
            `, [value, id]
        );
        return rows[0];
    }
}