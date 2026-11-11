CREATE TABLE IF NOT EXISTS public.transfers
(
    id serial NOT NULL,
    source_wallet_id integer NOT NULL,
    destination_wallet_id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    date date NOT NULL,
    description character varying COLLATE pg_catalog."default",
    workspace_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT transfers_pkey PRIMARY KEY (id)
);

