CREATE TABLE IF NOT EXISTS public.workspace_members
(
    id serial NOT NULL,
    workspace_id integer NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role character varying NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workspace_members_pkey PRIMARY KEY (id),
    CONSTRAINT workspace_members_unique UNIQUE (workspace_id, user_id)
);
