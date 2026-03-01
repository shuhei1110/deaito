-- T12c: お問い合わせテーブル
CREATE TABLE public.support_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_inquiries ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の問い合わせのみ INSERT 可能
CREATE POLICY "support_inquiries_insert_self"
  ON public.support_inquiries FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ユーザーは自分の問い合わせのみ SELECT 可能
CREATE POLICY "support_inquiries_select_self"
  ON public.support_inquiries FOR SELECT
  USING (user_id = auth.uid());
