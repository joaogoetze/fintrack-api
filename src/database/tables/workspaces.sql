CREATE TABLE IF NOT EXISTS public.workspaces
(
    id serial NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    owner_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workspaces_pkey PRIMARY KEY (id)
);