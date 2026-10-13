import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/google', (req, res) => authController.googleLogin(req, res));
authRoutes.get('/me', authMiddleware, (req, res) => authController.getMe(req, res));

// Rotas de Workspaces e Convites
authRoutes.post('/workspaces', authMiddleware, (req, res) => authController.createWorkspace(req, res));
authRoutes.post('/workspaces/:workspaceId/invites', authMiddleware, (req, res) => authController.inviteUser(req, res));
authRoutes.get('/invites', authMiddleware, (req, res) => authController.getMyInvites(req, res));
authRoutes.post('/invites/:inviteId/accept', authMiddleware, (req, res) => authController.acceptInvite(req, res));
authRoutes.post('/invites/:inviteId/reject', authMiddleware, (req, res) => authController.rejectInvite(req, res));

