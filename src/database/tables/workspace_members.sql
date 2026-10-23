CREATE TABLE IF NOT EXISTS public.workspace_members
(
    id serial NOT NULL,
    workspace_id integer NOT NULL,
    user_id integer NOT NULL,
    role character varying COLLATE pg_catalog."default" NOT NULL DEFAULT 'member'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workspace_members_pkey PRIMARY KEY (id),
    CONSTRAINT workspace_members_unique UNIQUE (workspace_id, user_id)
);