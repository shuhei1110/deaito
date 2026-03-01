-- user_storage_quotas テーブル: ユーザーごとのストレージ使用量を管理
-- デフォルト 256 MiB (268435456 bytes) のクォータを各ユーザーに付与

create table if not exists public.user_storage_quotas (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  quota_bytes bigint not null default 268435456,  -- 256 MiB
  used_bytes bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_storage_quotas enable row level security;

-- 自分のクォータのみ読取可能
create policy "user_storage_quotas_read_self"
on public.user_storage_quotas for select
using (user_id = auth.uid());

-- updated_at 自動更新
create trigger set_user_storage_quotas_updated_at
before update on public.user_storage_quotas
for each row execute function public.set_updated_at();

-- profiles 作成時に自動でクォータ行を作成するトリガー
create or replace function public.create_storage_quota_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_storage_quotas (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger create_storage_quota_after_profile
after insert on public.profiles
for each row execute function public.create_storage_quota_for_new_user();

-- 既存ユーザーのバックフィル
insert into public.user_storage_quotas (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

-- RPC: FOR UPDATE ロック付きでクォータ取得（同時アップロード対策）
create or replace function public.get_quota_for_update(p_user_id uuid)
returns table(quota_bytes bigint, used_bytes bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select q.quota_bytes, q.used_bytes
    from public.user_storage_quotas q
    where q.user_id = p_user_id
    for update;
end;
$$;

-- RPC: used_bytes を加算
create or replace function public.increment_used_bytes(p_user_id uuid, p_size bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_storage_quotas
  set used_bytes = used_bytes + p_size
  where user_id = p_user_id;
end;
$$;

-- RPC: used_bytes を減算
create or replace function public.decrement_used_bytes(p_user_id uuid, p_size bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_storage_quotas
  set used_bytes = greatest(0, used_bytes - p_size)
  where user_id = p_user_id;
end;
$$;
