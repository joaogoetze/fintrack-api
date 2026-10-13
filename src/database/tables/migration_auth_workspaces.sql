-- 1. Criação das novas tabelas
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

CREATE TABLE IF NOT EXISTS public.workspaces
(
    id serial NOT NULL,
    name character varying NOT NULL,
    is_personal boolean DEFAULT false,
    owner_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workspaces_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.workspace_members
(
    id serial NOT NULL,
    workspace_id integer NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role character varying NOT NULL DEFAULT 'member',
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workspace_members_pkey PRIMARY KEY (id),
    CONSTRAINT workspace_members_unique UNIQUE (workspace_id, user_id)
);

-- 2. Adicionando workspace_id e created_by nas tabelas existentes (se ainda não existirem)
ALTER TABLE public.wallets 
    ADD COLUMN IF NOT EXISTS workspace_id integer REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.recurring_transactions 
    ADD COLUMN IF NOT EXISTS workspace_id integer REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.expenses 
    ADD COLUMN IF NOT EXISTS workspace_id integer REFERENCES public.workspaces(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS created_by integer REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.incomes 
    ADD COLUMN IF NOT EXISTS workspace_id integer REFERENCES public.workspaces(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS created_by integer REFERENCES public.users(id) ON DELETE SET NULL;
