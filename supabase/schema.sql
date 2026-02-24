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
alter table public.connections enable row level security;
alter table public.invitations enable row level security;
alter table public.reunion_proposals enable row level security;

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

create policy "events_write_if_admin"
on public.events for all
using (
  exists (
    select 1 from public.album_members am
    where am.album_id = events.album_id
      and am.user_id = auth.uid()
      and am.role in ('owner', 'admin')
      and am.membership_status = 'active'
  )
)
with check (
  exists (
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
