CREATE TABLE IF NOT EXISTS public.expenses
(
    id serial NOT NULL,
    name character varying COLLATE pg_catalog."default",
    amount numeric(12,2),
    date date,
    wallet_id integer,
    recurring_transaction_id integer,
    due_date date,
    paid boolean DEFAULT true,
    deleted_at timestamp with time zone,
    CONSTRAINT expenses_pkey PRIMARY KEY (id)
)