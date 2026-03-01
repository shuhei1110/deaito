-- A案: メンバー全員参加型の権限モデル
-- events: 全メンバーが作成可能、編集・削除は作成者本人 or owner/admin
-- media_assets: 全メンバーがアップロード可能、削除は本人 or owner/admin

-- === events テーブル ===

-- 既存の write ポリシーを削除（owner/admin のみだった）
drop policy if exists "events_write_if_admin" on public.events;

-- INSERT: アルバムの active メンバーなら誰でも作成可能（created_by = 自分）
create policy "events_insert_if_member"
on public.events for insert
with check (
  created_by = auth.uid()
  and public.is_album_member(album_id)
);

-- UPDATE: 作成者本人 or owner/admin
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

-- DELETE: 作成者本人 or owner/admin
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

-- === media_assets テーブル ===

-- 既存の DELETE ポリシーがない場合に備えて、update ポリシーを確認
-- INSERT は既に「メンバー & uploader_id = 自分」で正しい（変更不要）

-- DELETE: アップロード者本人 or owner/admin
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
