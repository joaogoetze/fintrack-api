import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { 
    googleLoginRequestSchema, 
    createWorkspaceRequestSchema, 
    inviteUserRequestSchema, 
    inviteParamSchema, 
    workspaceParamSchema 
} from '../types/Auth';

const authService = new AuthService();

export class AuthController {
    async googleLogin(req: Request, res: Response): Promise<void> {
        try {
            const parsed = googleLoginRequestSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ errors: parsed.error.flatten() });
                return;
            }

            const data = await authService.loginWithGoogle(parsed.data.credential);
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

            const parsed = createWorkspaceRequestSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ errors: parsed.error.flatten() });
                return;
            }

            const workspace = await authService.createWorkspace(parsed.data.name.trim(), req.user.id);
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

            const parsedParam = workspaceParamSchema.safeParse(req.params);
            if (!parsedParam.success) {
                res.status(400).json({ errors: parsedParam.error.flatten() });
                return;
            }

            const parsedBody = inviteUserRequestSchema.safeParse(req.body);
            if (!parsedBody.success) {
                res.status(400).json({ errors: parsedBody.error.flatten() });
                return;
            }

            const invite = await authService.inviteUser(
                parsedParam.data.workspaceId, 
                req.user.id, 
                req.user.email, 
                parsedBody.data.email
            );
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

            const parsedParam = inviteParamSchema.safeParse(req.params);
            if (!parsedParam.success) {
                res.status(400).json({ errors: parsedParam.error.flatten() });
                return;
            }

            const workspaces = await authService.acceptInvite(parsedParam.data.inviteId, req.user.id, req.user.email);
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

            const parsedParam = inviteParamSchema.safeParse(req.params);
            if (!parsedParam.success) {
                res.status(400).json({ errors: parsedParam.error.flatten() });
                return;
            }

            const invite = await authService.rejectInvite(parsedParam.data.inviteId, req.user.email);
            res.json({ success: true, invite });
        } catch (error: any) {
            console.error('Erro ao recusar convite:', error);
            res.status(400).json({ error: error.message || 'Erro ao recusar convite' });
        }
    }
}
