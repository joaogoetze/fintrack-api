export interface User {
    id: number;
    google_id: string;
    email: string;
    name: string;
    avatar_url?: string | null;
    created_at?: string;
}

export interface Workspace {
    id: number;
    name: string;
    is_personal: boolean;
    owner_id: number;
    role?: 'owner' | 'admin' | 'member';
    created_at?: string;
}

export interface WorkspaceMember {
    id: number;
    workspace_id: number;
    user_id: number;
    role: 'owner' | 'admin' | 'member';
    created_at?: string;
}

export interface WorkspaceInvite {
    id: number;
    workspace_id: number;
    workspace_name?: string;
    invited_email: string;
    invited_by: number;
    inviter_name?: string;
    inviter_email?: string;
    inviter_avatar?: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    created_at?: string;
}

