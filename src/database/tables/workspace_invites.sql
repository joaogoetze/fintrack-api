CREATE TABLE IF NOT EXISTS public.workspace_invites
(
    id serial NOT NULL,
    workspace_id integer NOT NULL,
    invited_email character varying COLLATE pg_catalog."default" NOT NULL,
    invited_by integer NOT NULL,
    status character varying COLLATE pg_catalog."default" NOT NULL DEFAULT 'pending'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workspace_invites_pkey PRIMARY KEY (id)
);