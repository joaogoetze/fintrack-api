import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repository/auth.repository';

const JWT_SECRET = process.env.JWT_SECRET || 'fintrack_super_secret_jwt_key_change_in_production';
const authRepository = new AuthRepository();

export interface AuthenticatedUser {
    id: number;
    email: string;
    name: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
            workspaceId?: number;
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: 'Token de autenticação não fornecido' });
        return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res.status(401).json({ error: 'Formato de token inválido' });
        return;
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido ou expirado' });
        return;
    }
}

export async function workspaceMiddleware(req: Request, res: Response, next: NextFunction) {
    const workspaceHeader = req.headers['x-workspace-id'];

    if (!workspaceHeader) {
        res.status(400).json({ error: 'Header x-workspace-id não fornecido' });
        return;
    }

    const workspaceId = Number(workspaceHeader);
    if (isNaN(workspaceId)) {
        res.status(400).json({ error: 'Workspace ID inválido' });
        return;
    }

    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
    }

    // Valida se o usuário autenticado é membro deste workspace
    const hasAccess = await authRepository.isUserInWorkspace(req.user.id, workspaceId);
    if (!hasAccess) {
        res.status(403).json({ error: 'Acesso negado para este workspace' });
        return;
    }

    req.workspaceId = workspaceId;
    next();
}
