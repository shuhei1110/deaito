-- T13: RLS ギャップ修正
-- media_views / notifications の RLS 有効化、media_reactions の DELETE ポリシー追加

-- 1. media_views: RLS 有効化
ALTER TABLE public.media_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_views_select_member" ON public.media_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.media_assets m
      WHERE m.id = media_views.media_id
        AND public.is_album_member(m.album_id)
    )
  );

CREATE POLICY "media_views_insert_self" ON public.media_views
  FOR INSERT WITH CHECK (
    viewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.media_assets m
      WHERE m.id = media_views.media_id
        AND public.is_album_member(m.album_id)
    )
  );

-- 2. notifications: RLS 有効化
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_self" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_self" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- INSERT は admin (createNotification) 経由のみ → ポリシー不要

-- 3. media_reactions: DELETE ポリシー追加（いいね解除用）
CREATE POLICY "media_reactions_delete_self" ON public.media_reactions
  FOR DELETE USING (user_id = auth.uid());
