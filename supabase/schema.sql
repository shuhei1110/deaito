-- Supabase schema for deaito commercial version
-- Apply in Supabase SQL Editor

create extension if not exists pgcrypto;

create type public.album_category as enum ('school', 'club', 'circle', 'friends', 'seminar', 'company');
create type public.album_visibility as enum ('private', 'members', 'public');
create type public.member_role as enum ('owner', 'admin', 'member');
create type public.membership_status as enum ('active', 'pending', 'left');
create type public.media_type as enum ('image', 'video');
create type public.invitation_status as enum ('pending', 'accepted', 'declined', 'cancelled');
create type public.connection_status as enum ('active', 'blocked');
create type public.proposal_status as enum ('draft', 'proposed', 'confirmed', 'cancelled');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text not null,
  avatar_url text,
  bio text,
  graduation_year int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  category public.album_category not null default 'school',
  year int,
  location text,
  description text,
  visibility public.album_visibility not null default 'members',
  join_code text not null default encode(gen_random_bytes(5), 'hex') unique,
  tsunagu_threshold int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.album_members (
  album_id uuid not null references public.albums(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'member',
  membership_status public.membership_status not null default 'active',
  joined_at timestamptz,
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (album_id, user_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  parent_event_id uuid references public.events(id) on delete set null,
  name text not null,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  sort_order int not null default 0,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  uploader_id uuid not null references public.profiles(id) on delete restrict,
  bucket text not null default 'album-media',
  object_path text not null,
  media_type public.media_type not null,
  mime_type text,
  size_bytes bigint,
  width int,
  height int,
  duration_seconds int,
  thumbnail_path text,
  captured_at timestamptz,
  created_at timestamptz not null default now(),
  unique (bucket, object_path)
);

create table if not exists public.media_comments (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media_assets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_reactions (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media_assets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null default 'like',
  created_at timestamptz not null default now(),
  unique (media_id, user_id, reaction)
);

create table if not exists public.album_views (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  viewed_date date not null default current_date,
  view_count int not null default 1,
  created_at timestamptz not null default now(),
  unique (album_id, viewer_id, viewed_date)
);

create index if not exists idx_album_views_album_id on public.album_views(album_id);
create index if not exists idx_album_views_viewed_date on public.album_views(viewed_date);

create table if not exists public.media_views (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media_assets(id) on delete cascade,
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (media_id, viewer_id)
);

create index if not exists idx_media_views_media_id on public.media_views(media_id);

-- 通知
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_unread
  on public.notifications(user_id, is_read, created_at desc);

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  user_low_id uuid not null references public.profiles(id) on delete cascade,
  user_high_id uuid not null references public.profiles(id) on delete cascade,
  strength smallint not null default 50 check (strength between 1 and 100),
  status public.connection_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_low_id < user_high_id),
  unique (album_id, user_low_id, user_high_id)
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  status public.invitation_status not null default 'pending',
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reunion_proposals (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  proposed_by uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  summary text,
  proposed_dates jsonb not null default '[]'::jsonb,
  location_candidates jsonb not null default '[]'::jsonb,
  status public.proposal_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_storage_quotas (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  quota_bytes bigint not null default 268435456,  -- 256 MiB
  used_bytes bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_album_member(target_album uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.album_members am
    where am.album_id = target_album
      and am.user_id = auth.uid()
      and am.membership_status = 'active'
  );
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_albums_updated_at
before update on public.albums
for each row execute function public.set_updated_at();

create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger set_media_comments_updated_at
before update on public.media_comments
for each row execute function public.set_updated_at();

create trigger set_connections_updated_at
before update on public.connections
for each row execute function public.set_updated_at();

create trigger set_reunion_proposals_updated_at
before update on public.reunion_proposals
for each row execute function public.set_updated_at();

create trigger set_user_storage_quotas_updated_at
before update on public.user_storage_quotas
for each row execute function public.set_updated_at();

-- profiles 作成時に自動でクォータ行を作成
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

-- RPC: FOR UPDATE ロック付きでクォータ取得
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

create index if not exists idx_albums_owner_id on public.albums(owner_id);
create index if not exists idx_album_members_user_id on public.album_members(user_id);
create index if not exists idx_events_album_id on public.events(album_id);
create index if not exists idx_events_parent_event_id on public.events(parent_event_id);
create index if not exists idx_media_assets_album_id on public.media_assets(album_id);
create index if not exists idx_media_assets_event_id on public.media_assets(event_id);
create index if not exists idx_media_comments_media_id on public.media_comments(media_id);
create index if not exists idx_media_reactions_media_id on public.media_reactions(media_id);
create index if not exists idx_connections_album_id on public.connections(album_id);
create index if not exists idx_invitations_album_id on public.invitations(album_id);
create index if not exists idx_invitations_recipient_id on public.invitations(recipient_id);
create index if not exists idx_reunion_proposals_album_id on public.reunion_proposals(album_id);

alter table public.profiles enable row level security;
alter table public.albums enable row level security;
alter table public.album_members enable row level security;
alter table public.events enable row level security;
alter table public.media_assets enable row level security;
alter table public.media_comments enable row level security;
alter table public.media_reactions enable row level security;
alter table public.album_views enable row level security;
alter table public.connections enable row level security;
alter table public.invitations enable row level security;
alter table public.reunion_proposals enable row level security;
alter table public.user_storage_quotas enable row level security;

create policy "profiles_read_authenticated"
on public.profiles for select
using (auth.role() = 'authenticated');

create policy "profiles_update_self"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "albums_read_public_or_member"
on public.albums for select
using (
  visibility = 'public'
  or owner_id = auth.uid()
  or public.is_album_member(id)
);

create policy "albums_insert_owner"
on public.albums for insert
with check (owner_id = auth.uid());

create policy "albums_update_owner_or_admin"
on public.albums for update
using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.album_members am
    where am.album_id = albums.id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
      and am.membership_status = 'active'
  )
)
with check (
  owner_id = auth.uid()
  or exists (
    select 1 from public.album_members am
    where am.album_id = albums.id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
      and am.membership_status = 'active'
  )
);

create policy "album_members_read_if_same_album"
on public.album_members for select
using (
  user_id = auth.uid()
  or public.is_album_member(album_id)
);

create policy "album_members_insert_by_owner_or_admin"
on public.album_members for insert
with check (
  exists (
    select 1 from public.album_members am
    where am.album_id = album_members.album_id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
      and am.membership_status = 'active'
  )
  or exists (
    select 1 from public.albums a
    where a.id = album_members.album_id
      and a.owner_id = auth.uid()
  )
);

create policy "events_read_if_member"
on public.events for select
using (public.is_album_member(album_id) or exists (
  select 1 from public.albums a
  where a.id = events.album_id and a.visibility = 'public'
));

create policy "events_insert_if_member"
on public.events for insert
with check (
  created_by = auth.uid()
  and public.is_album_member(album_id)
);

create policy "events_update_if_creator_or_admin"
on public.events for update
using (
  created_by = auth.uid()
  or exists (
    select 1 from public.album_members am
    where am.album_id = events.album_id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
      and am.membership_status = 'active'
  )
)
with check (
  created_by = auth.uid()
  or exists (
    select 1 from public.album_members am
    where am.album_id = events.album_id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
      and am.membership_status = 'active'
  )
);

create policy "events_delete_if_creator_or_admin"
on public.events for delete
using (
  created_by = auth.uid()
  or exists (
    select 1 from public.album_members am
    where am.album_id = events.album_id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
      and am.membership_status = 'active'
  )
);

create policy "media_assets_read_if_member"
on public.media_assets for select
using (public.is_album_member(album_id) or exists (
  select 1 from public.albums a
  where a.id = media_assets.album_id and a.visibility = 'public'
));

create policy "media_assets_insert_if_member"
on public.media_assets for insert
with check (public.is_album_member(album_id) and uploader_id = auth.uid());

create policy "media_assets_update_if_uploader_or_admin"
on public.media_assets for update
using (
  uploader_id = auth.uid()
  or exists (
    select 1 from public.album_members am
    where am.album_id = media_assets.album_id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
      and am.membership_status = 'active'
  )
)
with check (
  uploader_id = auth.uid()
  or exists (
    select 1 from public.album_members am
    where am.album_id = media_assets.album_id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
      and am.membership_status = 'active'
  )
);

create policy "media_assets_delete_if_uploader_or_admin"
on public.media_assets for delete
using (
  uploader_id = auth.uid()
  or exists (
    select 1 from public.album_members am
    where am.album_id = media_assets.album_id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
      and am.membership_status = 'active'
  )
);

create policy "media_comments_read_if_member"
on public.media_comments for select
using (
  exists (
    select 1 from public.media_assets m
    where m.id = media_comments.media_id
      and (public.is_album_member(m.album_id) or exists (
        select 1 from public.albums a where a.id = m.album_id and a.visibility = 'public'
      ))
  )
);

create policy "media_comments_insert_if_member"
on public.media_comments for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.media_assets m
    where m.id = media_comments.media_id
      and public.is_album_member(m.album_id)
  )
);

create policy "media_reactions_read_if_member"
on public.media_reactions for select
using (
  exists (
    select 1 from public.media_assets m
    where m.id = media_reactions.media_id
      and (public.is_album_member(m.album_id) or exists (
        select 1 from public.albums a where a.id = m.album_id and a.visibility = 'public'
      ))
  )
);

create policy "media_reactions_insert_if_member"
on public.media_reactions for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.media_assets m
    where m.id = media_reactions.media_id
      and public.is_album_member(m.album_id)
  )
);

create policy "album_views_read_if_member"
on public.album_views for select
using (public.is_album_member(album_id));

create policy "album_views_insert_if_member"
on public.album_views for insert
with check (
  viewer_id = auth.uid()
  and public.is_album_member(album_id)
);

create policy "album_views_update_own"
on public.album_views for update
using (viewer_id = auth.uid())
with check (viewer_id = auth.uid());

create policy "connections_read_if_member"
on public.connections for select
using (public.is_album_member(album_id));

create policy "connections_write_if_admin"
on public.connections for all
using (
  exists (
    select 1 from public.album_members am
    where am.album_id = connections.album_id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
      and am.membership_status = 'active'
  )
)
with check (
  exists (
    select 1 from public.album_members am
    where am.album_id = connections.album_id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
      and am.membership_status = 'active'
  )
);

create policy "invitations_read_sender_or_recipient_or_admin"
on public.invitations for select
using (
  sender_id = auth.uid()
  or recipient_id = auth.uid()
  or exists (
    select 1 from public.album_members am
    where am.album_id = invitations.album_id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
      and am.membership_status = 'active'
  )
);

create policy "invitations_insert_if_member"
on public.invitations for insert
with check (
  sender_id = auth.uid()
  and public.is_album_member(album_id)
);

create policy "invitations_update_recipient_or_admin"
on public.invitations for update
using (
  recipient_id = auth.uid()
  or exists (
    select 1 from public.album_members am
    where am.album_id = invitations.album_id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
      and am.membership_status = 'active'
  )
)
with check (
  recipient_id = auth.uid()
  or exists (
    select 1 from public.album_members am
    where am.album_id = invitations.album_id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
      and am.membership_status = 'active'
  )
);

create policy "reunion_proposals_read_if_member"
on public.reunion_proposals for select
using (public.is_album_member(album_id));

create policy "reunion_proposals_write_if_member"
on public.reunion_proposals for all
using (public.is_album_member(album_id))
with check (public.is_album_member(album_id) and proposed_by = auth.uid());

create policy "user_storage_quotas_read_self"
on public.user_storage_quotas for select
using (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('album-media', 'album-media', false)
on conflict (id) do nothing;

create policy "storage_read_album_media"
on storage.objects for select
using (
  bucket_id = 'album-media'
  and exists (
    select 1
    from public.media_assets m
    where m.bucket = storage.objects.bucket_id
      and m.object_path = storage.objects.name
      and (public.is_album_member(m.album_id) or exists (
        select 1 from public.albums a where a.id = m.album_id and a.visibility = 'public'
      ))
  )
);

create policy "storage_upload_album_media"
on storage.objects for insert
with check (
  bucket_id = 'album-media'
  and exists (
    select 1
    from public.media_assets m
    where m.bucket = storage.objects.bucket_id
      and m.object_path = storage.objects.name
      and m.uploader_id = auth.uid()
      and public.is_album_member(m.album_id)
  )
);

create policy "storage_delete_album_media"
on storage.objects for delete
using (
  bucket_id = 'album-media'
  and exists (
    select 1
    from public.media_assets m
    where m.bucket = storage.objects.bucket_id
      and m.object_path = storage.objects.name
      and (
        m.uploader_id = auth.uid()
        or exists (
          select 1 from public.album_members am
          where am.album_id = m.album_id
            and am.user_id = auth.uid()
            and am.role in ('owner', 'admin')
            and am.membership_status = 'active'
        )
      )
  )
);

-- RPC: 閲覧記録（INSERT or UPDATE view_count += 1）
create or replace function public.increment_album_view(
  p_album_id uuid,
  p_viewer_id uuid
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.album_views (album_id, viewer_id, viewed_date, view_count)
  values (p_album_id, p_viewer_id, current_date, 1)
  on conflict (album_id, viewer_id, viewed_date)
  do update set view_count = album_views.view_count + 1;
$$;

-- RPC: つなぐポイント重み付き計算
-- 算式: category_score = round(sqrt(unique_users) * ln(1 + total_count) * momentum)
-- momentum = 1 + 0.5 * min(recent_7d / max(total, 1), 1)
create or replace function public.calculate_tsunagu_points(p_album_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_7days_ago date := current_date - 7;

  v_views_unique int;
  v_views_total int;
  v_views_recent int;
  v_views_score numeric;

  v_uploads_unique int;
  v_uploads_total int;
  v_uploads_recent int;
  v_uploads_score numeric;

  v_likes_unique int;
  v_likes_total int;
  v_likes_recent int;
  v_likes_score numeric;

  v_comments_unique int;
  v_comments_total int;
  v_comments_recent int;
  v_comments_score numeric;
begin
  -- Views
  select
    coalesce(count(distinct viewer_id), 0),
    coalesce(sum(view_count), 0)
  into v_views_unique, v_views_total
  from public.album_views
  where album_id = p_album_id;

  select coalesce(sum(view_count), 0)
  into v_views_recent
  from public.album_views
  where album_id = p_album_id
    and viewed_date >= v_7days_ago;

  -- Uploads
  select
    coalesce(count(distinct uploader_id), 0),
    coalesce(count(*), 0)
  into v_uploads_unique, v_uploads_total
  from public.media_assets
  where album_id = p_album_id;

  select coalesce(count(*), 0)
  into v_uploads_recent
  from public.media_assets
  where album_id = p_album_id
    and created_at >= (now() - interval '7 days');

  -- Likes
  select
    coalesce(count(distinct mr.user_id), 0),
    coalesce(count(*), 0)
  into v_likes_unique, v_likes_total
  from public.media_reactions mr
  join public.media_assets ma on ma.id = mr.media_id
  where ma.album_id = p_album_id;

  select coalesce(count(*), 0)
  into v_likes_recent
  from public.media_reactions mr
  join public.media_assets ma on ma.id = mr.media_id
  where ma.album_id = p_album_id
    and mr.created_at >= (now() - interval '7 days');

  -- Comments
  select
    coalesce(count(distinct mc.user_id), 0),
    coalesce(count(*), 0)
  into v_comments_unique, v_comments_total
  from public.media_comments mc
  join public.media_assets ma on ma.id = mc.media_id
  where ma.album_id = p_album_id;

  select coalesce(count(*), 0)
  into v_comments_recent
  from public.media_comments mc
  join public.media_assets ma on ma.id = mc.media_id
  where ma.album_id = p_album_id
    and mc.created_at >= (now() - interval '7 days');

  -- score = round(sqrt(unique) * ln(1 + total) * (1 + 0.5 * min(recent/max(total,1), 1)))
  v_views_score := round(
    sqrt(greatest(v_views_unique, 0)) * ln(1 + v_views_total)
    * (1 + 0.5 * least(v_views_recent::numeric / greatest(v_views_total, 1), 1))
  );
  v_uploads_score := round(
    sqrt(greatest(v_uploads_unique, 0)) * ln(1 + v_uploads_total)
    * (1 + 0.5 * least(v_uploads_recent::numeric / greatest(v_uploads_total, 1), 1))
  );
  v_likes_score := round(
    sqrt(greatest(v_likes_unique, 0)) * ln(1 + v_likes_total)
    * (1 + 0.5 * least(v_likes_recent::numeric / greatest(v_likes_total, 1), 1))
  );
  v_comments_score := round(
    sqrt(greatest(v_comments_unique, 0)) * ln(1 + v_comments_total)
    * (1 + 0.5 * least(v_comments_recent::numeric / greatest(v_comments_total, 1), 1))
  );

  return jsonb_build_object(
    'views', v_views_score,
    'uploads', v_uploads_score,
    'likes', v_likes_score,
    'comments', v_comments_score,
    'total', v_views_score + v_uploads_score + v_likes_score + v_comments_score,
    'raw_views', v_views_total,
    'raw_uploads', v_uploads_total,
    'raw_likes', v_likes_total,
    'raw_comments', v_comments_total
  );
end;
$$;
