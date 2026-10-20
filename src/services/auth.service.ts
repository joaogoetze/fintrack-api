import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repository/auth.repository';
import { User, Workspace } from '../types/Auth';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'fintrack_super_secret_jwt_key_change_in_production';

export class AuthService {
    private authRepository: AuthRepository;

    constructor() {
        this.authRepository = new AuthRepository();
    }

    async loginWithGoogle(credential: string): Promise<{ token: string; user: User; workspaces: Workspace[] }> {
        // Valida o id_token recebido do Google
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.sub || !payload.email) {
            throw new Error('Invalid Google Token');
        }

        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name || 'Usuário';
        const avatarUrl = payload.picture;

        // Procura ou cria o usuário
        let user = await this.authRepository.findUserByGoogleId(googleId);

        if (!user) {
            user = await this.authRepository.findUserByEmail(email);
        }

        if (!user) {
            user = await this.authRepository.createUser(googleId, email, name, avatarUrl);
        }

        // Busca os workspaces aos quais o usuário pertence (pode vir vazio caso seja a primeira vez)
        const workspaces = await this.authRepository.getUserWorkspaces(user.id);


        // Gera token JWT de sessão da nossa aplicação
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            token,
            user,
            workspaces
        };
    }

    async getMe(userId: number): Promise<{ user: User; workspaces: Workspace[] }> {
        const user = await this.authRepository.findUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const workspaces = await this.authRepository.getUserWorkspaces(userId);
        return { user, workspaces };
    }

    async createWorkspace(name: string, userId: number): Promise<Workspace> {
        return this.authRepository.createWorkspace(name, userId);
    }


    async inviteUser(workspaceId: number, inviterId: number, inviterEmail: string, emailToInvite: string) {
        const cleanEmail = emailToInvite.toLowerCase().trim();
        if (cleanEmail === inviterEmail.toLowerCase().trim()) {
            throw new Error('Você não pode convidar a si mesmo');
        }

        const hasAccess = await this.authRepository.isUserInWorkspace(inviterId, workspaceId);
        if (!hasAccess) {
            throw new Error('Você não tem permissão para convidar para este espaço');
        }

        // Verifica se a pessoa já é membro
        const userToInvite = await this.authRepository.findUserByEmail(cleanEmail);
        if (userToInvite) {
            const alreadyMember = await this.authRepository.isUserInWorkspace(userToInvite.id, workspaceId);
            if (alreadyMember) {
                throw new Error('Este usuário já faz parte deste espaço');
            }
        }

        // Verifica se já tem convite pendente
        const existing = await this.authRepository.findPendingInvite(workspaceId, cleanEmail);
        if (existing) {
            throw new Error('Já existe um convite pendente para este e-mail');
        }

        return this.authRepository.createInvite(workspaceId, cleanEmail, inviterId);
    }

    async getMyInvites(email: string) {
        return this.authRepository.getPendingInvitesForEmail(email);
    }

    async acceptInvite(inviteId: number, userId: number, userEmail: string) {
        const invite = await this.authRepository.getInviteById(inviteId);
        if (!invite || invite.status !== 'pending') {
            throw new Error('Convite não encontrado ou já processado');
        }

        if (invite.invitedEmail.toLowerCase().trim() !== userEmail.toLowerCase().trim()) {
            throw new Error('Este convite não foi enviado para o seu e-mail');
        }

        await this.authRepository.acceptInvite(inviteId, userId, invite.workspaceId);
        return this.authRepository.getUserWorkspaces(userId);
    }

    async rejectInvite(inviteId: number, userEmail: string) {
        const invite = await this.authRepository.getInviteById(inviteId);
        if (!invite || invite.status !== 'pending') {
            throw new Error('Convite não encontrado ou já processado');
        }

        if (invite.invitedEmail.toLowerCase().trim() !== userEmail.toLowerCase().trim()) {
            throw new Error('Este convite não foi enviado para o seu e-mail');
        }

        return this.authRepository.rejectInvite(inviteId);
    }
}

