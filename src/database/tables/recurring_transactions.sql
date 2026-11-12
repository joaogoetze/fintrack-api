CREATE TABLE IF NOT EXISTS public.recurring_transactions
(
    id serial NOT NULL,
    type character varying COLLATE pg_catalog."default",
    name character varying COLLATE pg_catalog."default",
    amount numeric(12,2),
    start_date date,
    due_date date,
    workspace_id integer,
    category_id integer,
    deleted_at timestamp with time zone,
    CONSTRAINT recurring_transactions_pkey PRIMARY KEY (id)
);

ALTER TABLE public.recurring_transactions ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
