CREATE TABLE IF NOT EXISTS public.workspaces
(
    id serial NOT NULL,
    name character varying NOT NULL,
    is_personal boolean DEFAULT false,
    owner_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workspaces_pkey PRIMARY KEY (id)
);
