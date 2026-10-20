import { pool } from '../database';
import { User, Workspace } from '../types/Auth';
import { toCamel, toCamelMany } from '../utils/case';

export class AuthRepository {
    async findUserByGoogleId(googleId: string): Promise<User | null> {
        const { rows } = await pool.query(
            `SELECT * FROM users WHERE google_id = $1`,
            [googleId]
        );
        return rows.length ? toCamel(rows[0]) : null;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const { rows } = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );
        return rows.length ? toCamel(rows[0]) : null;
    }

    async findUserById(id: number): Promise<User | null> {
        const { rows } = await pool.query(
            `SELECT * FROM users WHERE id = $1`,
            [id]
        );
        return rows.length ? toCamel(rows[0]) : null;
    }

    async createUser(googleId: string, email: string, name: string, avatarUrl?: string | null): Promise<User> {
        const { rows } = await pool.query(
            `INSERT INTO users (google_id, email, name, avatar_url)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [googleId, email, name, avatarUrl || null]
        );
        return toCamel(rows[0]);
    }

    async createWorkspace(name: string, ownerId: number): Promise<Workspace> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const workspaceRes = await client.query(
                `INSERT INTO workspaces (name, owner_id)
                 VALUES ($1, $2)
                 RETURNING *`,
                [name, ownerId]
            );

            const workspace = toCamel<Workspace>(workspaceRes.rows[0]);

            await client.query(
                `INSERT INTO workspace_members (workspace_id, user_id, role)
                 VALUES ($1, $2, $3)`,
                [workspace.id, ownerId, 'owner']
            );

            await client.query('COMMIT');
            return workspace;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getUserWorkspaces(userId: number): Promise<Workspace[]> {
        const { rows } = await pool.query(
            `SELECT w.*, wm.role
             FROM workspaces w
             INNER JOIN workspace_members wm ON wm.workspace_id = w.id
             WHERE wm.user_id = $1
             ORDER BY w.id ASC`,
            [userId]
        );
        return toCamelMany(rows);
    }


    async isUserInWorkspace(userId: number, workspaceId: number): Promise<boolean> {
        const { rows } = await pool.query(
            `SELECT 1 FROM workspace_members WHERE user_id = $1 AND workspace_id = $2`,
            [userId, workspaceId]
        );
        return rows.length > 0;
    }

    async getWorkspaceById(workspaceId: number): Promise<Workspace | null> {
        const { rows } = await pool.query(
            `SELECT * FROM workspaces WHERE id = $1`,
            [workspaceId]
        );
        return rows.length ? toCamel(rows[0]) : null;
    }

    async createInvite(workspaceId: number, invitedEmail: string, invitedBy: number) {
        const { rows } = await pool.query(
            `INSERT INTO workspace_invites (workspace_id, invited_email, invited_by, status)
             VALUES ($1, $2, $3, 'pending')
             RETURNING *`,
            [workspaceId, invitedEmail.toLowerCase().trim(), invitedBy]
        );
        return toCamel(rows[0]);
    }

    async findPendingInvite(workspaceId: number, invitedEmail: string) {
        const { rows } = await pool.query(
            `SELECT * FROM workspace_invites 
             WHERE workspace_id = $1 AND LOWER(invited_email) = LOWER($2) AND status = 'pending'`,
            [workspaceId, invitedEmail.trim()]
        );
        return rows.length ? toCamel(rows[0]) : null;
    }

    async getPendingInvitesForEmail(email: string) {
        const { rows } = await pool.query(
            `SELECT wi.*, w.name as workspace_name, u.name as inviter_name, u.email as inviter_email, u.avatar_url as inviter_avatar
             FROM workspace_invites wi
             INNER JOIN workspaces w ON w.id = wi.workspace_id
             INNER JOIN users u ON u.id = wi.invited_by
             WHERE LOWER(wi.invited_email) = LOWER($1) AND wi.status = 'pending'
             ORDER BY wi.id DESC`,
            [email.trim()]
        );
        return toCamelMany(rows);
    }

    async getInviteById(inviteId: number) {
        const { rows } = await pool.query(
            `SELECT * FROM workspace_invites WHERE id = $1`,
            [inviteId]
        );
        return rows.length ? toCamel(rows[0]) : null;
    }

    async acceptInvite(inviteId: number, userId: number, workspaceId: number) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                `UPDATE workspace_invites 
                 SET status = 'accepted', updated_at = now() 
                 WHERE id = $1`,
                [inviteId]
            );

            await client.query(
                `INSERT INTO workspace_members (workspace_id, user_id, role)
                 VALUES ($1, $2, 'member')
                 ON CONFLICT (workspace_id, user_id) DO NOTHING`,
                [workspaceId, userId]
            );

            await client.query('COMMIT');

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async rejectInvite(inviteId: number) {
        const { rows } = await pool.query(
            `UPDATE workspace_invites 
             SET status = 'rejected', updated_at = now() 
             WHERE id = $1
             RETURNING *`,
            [inviteId]
        );
        return rows.length ? toCamel(rows[0]) : null;
    }
}

