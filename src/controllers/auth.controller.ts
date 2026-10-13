import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
    async googleLogin(req: Request, res: Response): Promise<void> {
        try {
            const { credential } = req.body;
            if (!credential) {
                res.status(400).json({ error: 'Credencial do Google não fornecida' });
                return;
            }

            const data = await authService.loginWithGoogle(credential);
            res.json(data);
        } catch (error: any) {
            console.error('Erro ao autenticar com Google:', error);
            res.status(400).json({ error: error.message || 'Falha ao autenticar com Google' });
        }
    }

    async getMe(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Não autenticado' });
                return;
            }

            const data = await authService.getMe(req.user.id);
            res.json(data);
        } catch (error: any) {
            console.error('Erro ao buscar dados do usuário:', error);
            res.status(500).json({ error: error.message || 'Erro interno' });
        }
    }

    async createWorkspace(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Não autenticado' });
                return;
            }

            const { name } = req.body;
            if (!name || !name.trim()) {
                res.status(400).json({ error: 'Nome do espaço é obrigatório' });
                return;
            }

            const workspace = await authService.createWorkspace(name.trim(), req.user.id);
            res.status(201).json(workspace);
        } catch (error: any) {
            console.error('Erro ao criar workspace:', error);
            res.status(400).json({ error: error.message || 'Erro ao criar espaço' });
        }
    }

    async inviteUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Não autenticado' });
                return;
            }

            const workspaceId = Number(req.params.workspaceId);
            const { email } = req.body;

            if (!workspaceId || isNaN(workspaceId)) {
                res.status(400).json({ error: 'Workspace ID inválido' });
                return;
            }

            if (!email || !email.trim()) {
                res.status(400).json({ error: 'E-mail é obrigatório' });
                return;
            }

            const invite = await authService.inviteUser(workspaceId, req.user.id, req.user.email, email);
            res.status(201).json(invite);
        } catch (error: any) {
            console.error('Erro ao enviar convite:', error);
            res.status(400).json({ error: error.message || 'Erro ao enviar convite' });
        }
    }

    async getMyInvites(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Não autenticado' });
                return;
            }

            const invites = await authService.getMyInvites(req.user.email);
            res.json(invites);
        } catch (error: any) {
            console.error('Erro ao buscar convites:', error);
            res.status(500).json({ error: error.message || 'Erro ao buscar convites' });
        }
    }

    async acceptInvite(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Não autenticado' });
                return;
            }

            const inviteId = Number(req.params.inviteId);
            if (!inviteId || isNaN(inviteId)) {
                res.status(400).json({ error: 'Invite ID inválido' });
                return;
            }

            const workspaces = await authService.acceptInvite(inviteId, req.user.id, req.user.email);
            res.json({ success: true, workspaces });
        } catch (error: any) {
            console.error('Erro ao aceitar convite:', error);
            res.status(400).json({ error: error.message || 'Erro ao aceitar convite' });
        }
    }

    async rejectInvite(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Não autenticado' });
                return;
            }

            const inviteId = Number(req.params.inviteId);
            if (!inviteId || isNaN(inviteId)) {
                res.status(400).json({ error: 'Invite ID inválido' });
                return;
            }

            const invite = await authService.rejectInvite(inviteId, req.user.email);
            res.json({ success: true, invite });
        } catch (error: any) {
            console.error('Erro ao recusar convite:', error);
            res.status(400).json({ error: error.message || 'Erro ao recusar convite' });
        }
    }
}

