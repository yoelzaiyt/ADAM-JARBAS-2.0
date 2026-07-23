-- JARBAS 2.0 PWA - Persistência real (Supabase)
-- Rodar no SQL Editor do projeto Supabase (https://ewajzxpqvlowslgsbnfl.supabase.co)
-- Usa auth.users nativo do Supabase Auth (não precisa de tabela de usuários própria).

create extension if not exists "pgcrypto";

-- ============================================================
-- PROJETOS
-- ============================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "projects_select_own" on public.projects
  for select using (auth.uid() = user_id);
create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "projects_update_own" on public.projects
  for update using (auth.uid() = user_id);
create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = user_id);

-- ============================================================
-- AGENTES / SKILLS CUSTOMIZADAS
-- ============================================================
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  system_prompt text not null,
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agents enable row level security;

create policy "agents_select_own" on public.agents
  for select using (auth.uid() = user_id);
create policy "agents_insert_own" on public.agents
  for insert with check (auth.uid() = user_id);
create policy "agents_update_own" on public.agents
  for update using (auth.uid() = user_id);
create policy "agents_delete_own" on public.agents
  for delete using (auth.uid() = user_id);

-- ============================================================
-- CONVERSAS
-- ============================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null default 'Nova conversa',
  provider text,
  mode text not null default 'chat',
  agent_id text, -- id de agents.id (uuid como texto) OU um id de agente padrão (ex: 'builtin-researcher')
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

create policy "conversations_select_own" on public.conversations
  for select using (auth.uid() = user_id);
create policy "conversations_insert_own" on public.conversations
  for insert with check (auth.uid() = user_id);
create policy "conversations_update_own" on public.conversations
  for update using (auth.uid() = user_id);
create policy "conversations_delete_own" on public.conversations
  for delete using (auth.uid() = user_id);

-- ============================================================
-- MENSAGENS
-- ============================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('system', 'user', 'assistant')),
  content text not null default '',
  provider text,
  model text,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "messages_select_own" on public.messages
  for select using (auth.uid() = user_id);
create policy "messages_insert_own" on public.messages
  for insert with check (auth.uid() = user_id);
create policy "messages_update_own" on public.messages
  for update using (auth.uid() = user_id);
create policy "messages_delete_own" on public.messages
  for delete using (auth.uid() = user_id);

create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists conversations_user_id_idx on public.conversations(user_id);
create index if not exists agents_user_id_idx on public.agents(user_id);
create index if not exists projects_user_id_idx on public.projects(user_id);
