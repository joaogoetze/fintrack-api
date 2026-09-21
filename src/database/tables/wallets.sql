CREATE TABLE IF NOT EXISTS public.wallets
(
    id serial NOT NULL,
    name character varying COLLATE pg_catalog."default",
    balance numeric(12,2),
    deleted_at timestamp with time zone,
    CONSTRAINT wallets_pkey PRIMARY KEY (id)
)
