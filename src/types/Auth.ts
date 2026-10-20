import { z } from "zod";

export const userSchema = z.object({
    id: z.number(),
    googleId: z.string(),
    email: z.string().email(),
    name: z.string(),
    avatarUrl: z.string().nullable().optional(),
    createdAt: z.coerce.date().optional(),
});

export const workspaceSchema = z.object({
    id: z.number(),
    name: z.string(),
    isPersonal: z.boolean().optional(),
    ownerId: z.number(),
    role: z.enum(["owner", "admin", "member"]).optional(),
    createdAt: z.coerce.date().optional(),
});


export const workspaceMemberSchema = z.object({
    id: z.number(),
    workspaceId: z.number(),
    userId: z.number(),
    role: z.enum(["owner", "admin", "member"]),
    createdAt: z.coerce.date().optional(),
});

export const workspaceInviteSchema = z.object({
    id: z.number(),
    workspaceId: z.number(),
    workspaceName: z.string().optional(),
    invitedEmail: z.string().email(),
    invitedBy: z.number(),
    inviterName: z.string().optional(),
    inviterEmail: z.string().email().optional(),
    inviterAvatar: z.string().nullable().optional(),
    status: z.enum(["pending", "accepted", "rejected"]),
    createdAt: z.coerce.date().optional(),
});

// Request Schemas
export const googleLoginRequestSchema = z.object({
    credential: z.string().min(1, "Credencial do Google é obrigatória"),
});

export const createWorkspaceRequestSchema = z.object({
    name: z.string().min(1, "Nome do espaço é obrigatório"),
});

export const inviteUserRequestSchema = z.object({
    email: z.string().email("E-mail inválido"),
});

export const inviteParamSchema = z.object({
    inviteId: z.coerce.number().int().positive(),
});

export const workspaceParamSchema = z.object({
    workspaceId: z.coerce.number().int().positive(),
});

// Tipos Inferidos
export type User = z.infer<typeof userSchema>;
export type Workspace = z.infer<typeof workspaceSchema>;
export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>;
export type WorkspaceInvite = z.infer<typeof workspaceInviteSchema>;
export type GoogleLoginRequest = z.infer<typeof googleLoginRequestSchema>;
export type CreateWorkspaceRequest = z.infer<typeof createWorkspaceRequestSchema>;
export type InviteUserRequest = z.infer<typeof inviteUserRequestSchema>;
