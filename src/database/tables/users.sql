CREATE TABLE IF NOT EXISTS public.users
(
    id serial NOT NULL,
    google_id character varying NOT NULL UNIQUE,
    email character varying NOT NULL UNIQUE,
    name character varying NOT NULL,
    avatar_url character varying,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id)
);
