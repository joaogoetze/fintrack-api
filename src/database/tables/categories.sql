CREATE TABLE IF NOT EXISTS public.categories
(
    id serial NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    workspace_id integer NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT categories_pkey PRIMARY KEY (id)
);
