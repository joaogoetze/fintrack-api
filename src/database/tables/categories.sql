CREATE TABLE IF NOT EXISTS public.categories
(
    id serial NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    workspace_id integer NOT NULL,
    estimated_amount numeric(12,2),
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT categories_pkey PRIMARY KEY (id)
);

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS estimated_amount numeric(12,2);
