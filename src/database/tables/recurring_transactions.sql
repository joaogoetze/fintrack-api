CREATE TABLE IF NOT EXISTS public.recurring_transactions
(
    id serial NOT NULL,
    type character varying COLLATE pg_catalog."default",
    name character varying COLLATE pg_catalog."default",
    amount numeric(12,2),
    start_date date,
    due_date date,
    CONSTRAINT recurring_transactions_pkey PRIMARY KEY (id)
)