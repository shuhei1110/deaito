-- メディア閲覧数トラッキング用テーブル
CREATE TABLE IF NOT EXISTS public.media_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  viewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (media_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_media_views_media_id ON public.media_views(media_id);
