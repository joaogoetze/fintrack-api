CREATE TABLE IF NOT EXISTS public.workspace_invites
(
    id serial NOT NULL,
    workspace_id integer NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    invited_email character varying NOT NULL,
    invited_by integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status character varying NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workspace_invites_pkey PRIMARY KEY (id)
);
