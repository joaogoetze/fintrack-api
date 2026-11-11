import 'dotenv/config';
import { pool } from '../database';
import { toCamel } from '../utils/case';
import { formatDateOnly } from '../utils/dates';
import { CreateTransferRequest, Transfer } from '../types/Transfer';
import { AppError } from '../utils/errors';

export class TransferRepository {
    async createTransfer(data: CreateTransferRequest): Promise<Transfer> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const checkWallets = await client.query(
                `SELECT id, name, balance, workspace_id FROM wallets 
                 WHERE id IN ($1, $2) AND workspace_id = $3 AND deleted_at IS NULL`,
                [data.sourceWalletId, data.destinationWalletId, data.workspaceId]
            );

            if (checkWallets.rows.length !== 2) {
                throw new AppError(404, 'Uma ou ambas as carteiras não foram encontradas neste espaço');
            }

            const sourceWallet = checkWallets.rows.find((r: any) => r.id === data.sourceWalletId);
            if (sourceWallet && Number(sourceWallet.balance) < data.amount) {
                throw new AppError(400, 'Saldo insuficiente na carteira de origem');
            }

            await client.query(
                `UPDATE wallets 
                 SET balance = balance - $1 
                 WHERE id = $2 AND workspace_id = $3`,
                [data.amount, data.sourceWalletId, data.workspaceId]
            );

            await client.query(
                `UPDATE wallets 
                 SET balance = balance + $1 
                 WHERE id = $2 AND workspace_id = $3`,
                [data.amount, data.destinationWalletId, data.workspaceId]
            );

            const { rows } = await client.query(
                `INSERT INTO transfers 
                 (source_wallet_id, destination_wallet_id, amount, date, description, workspace_id)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [
                    data.sourceWalletId,
                    data.destinationWalletId,
                    data.amount,
                    data.date,
                    data.description || null,
                    data.workspaceId,
                ]
            );

            await client.query('COMMIT');

            const transfer = toCamel<Transfer>(rows[0]);
            return {
                ...transfer,
                date: formatDateOnly(transfer.date) as string,
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

