-- Clube Aphrodite — schema inicial da comunidade (v1)
create extension if not exists pgcrypto;

-- ============================================================
-- Tabelas
-- ============================================================

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  kiwify_order_id text,
  kiwify_subscription_id text,
  product_id text,
  status text not null check (status in ('active','canceled','refunded','late','pending')),
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_email_idx on subscriptions (email);
-- Índices únicos (não parciais): permitem upsert idempotente no
-- webhook da Kiwify via ON CONFLICT (reenvios não devem criar linhas
-- duplicadas). Múltiplos NULLs não conflitam entre si em índices
-- únicos do Postgres, então não é preciso "where ... is not null" —
-- e um índice parcial aqui quebraria o ON CONFLICT simples usado
-- pelo Supabase (.upsert), que não referencia o predicado da
-- cláusula WHERE.
create unique index subscriptions_kiwify_subscription_id_key
  on subscriptions (kiwify_subscription_id);
create unique index subscriptions_kiwify_order_id_key
  on subscriptions (kiwify_order_id);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz not null default now()
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  media_url text,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);
create index posts_created_at_idx on posts (created_at desc);

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
create index comments_post_id_idx on comments (post_id);

create table likes (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table library_items (
  id uuid primary key default gen_random_uuid(),
  week_start_date date not null,
  title text not null,
  description text,
  media_type text not null check (media_type in ('video','audio','text','pdf')),
  media_url text,
  content_text text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index library_items_week_idx on library_items (week_start_date desc);

-- ============================================================
-- updated_at trigger (subscriptions)
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger subscriptions_set_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

-- ============================================================
-- Funções de acesso (security definer para poder ler tabelas
-- protegidas por RLS sem expor os dados brutos ao cliente)
-- ============================================================

create or replace function is_active_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from subscriptions s
    where s.email = auth.jwt() ->> 'email' and s.status = 'active'
  );
$$;
revoke all on function is_active_member() from public;
grant execute on function is_active_member() to authenticated;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;
revoke all on function is_admin() from public;
grant execute on function is_admin() to authenticated;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table subscriptions enable row level security;
-- Nenhuma policy: só acessível via service_role (webhook) ou via
-- is_active_member(), que roda como security definer.

alter table profiles enable row level security;
create policy "membros ativos veem perfis" on profiles
  for select using (is_active_member());
create policy "usuária cria o próprio perfil" on profiles
  for insert with check (id = auth.uid() and is_active_member());
create policy "usuária edita o próprio perfil" on profiles
  for update using (id = auth.uid() or is_admin());

alter table posts enable row level security;
create policy "membros ativos veem posts" on posts
  for select using (is_active_member());
create policy "membros ativos criam posts" on posts
  for insert with check (author_id = auth.uid() and is_active_member());
create policy "autora ou admin edita post" on posts
  for update using (author_id = auth.uid() or is_admin());
create policy "autora ou admin apaga post" on posts
  for delete using (author_id = auth.uid() or is_admin());

alter table comments enable row level security;
create policy "membros ativos veem comentários" on comments
  for select using (is_active_member());
create policy "membros ativos comentam" on comments
  for insert with check (author_id = auth.uid() and is_active_member());
create policy "autora ou admin apaga comentário" on comments
  for delete using (author_id = auth.uid() or is_admin());

alter table likes enable row level security;
create policy "membros ativos veem curtidas" on likes
  for select using (is_active_member());
create policy "membros ativos curtem" on likes
  for insert with check (user_id = auth.uid() and is_active_member());
create policy "usuária remove a própria curtida" on likes
  for delete using (user_id = auth.uid());

alter table library_items enable row level security;
create policy "membros ativos veem a biblioteca" on library_items
  for select using (is_active_member());
-- Sem policies de insert/update/delete: conteúdo é gerido pela
-- dona do clube via Supabase Studio (service_role), fora do app.
