-- T18: ストレージクォータ再集計関数
-- media_assets.size_bytes の実合計で user_storage_quotas.used_bytes を補正する

CREATE OR REPLACE FUNCTION public.reconcile_storage_quotas()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  corrected_count integer;
BEGIN
  WITH actual AS (
    SELECT uploader_id, COALESCE(SUM(size_bytes), 0)::bigint AS total
    FROM public.media_assets
    GROUP BY uploader_id
  )
  UPDATE public.user_storage_quotas q
  SET used_bytes = COALESCE(a.total, 0),
      updated_at = now()
  FROM (
    SELECT q2.user_id, COALESCE(a2.total, 0) AS total
    FROM public.user_storage_quotas q2
    LEFT JOIN actual a2 ON a2.uploader_id = q2.user_id
  ) a
  WHERE q.user_id = a.user_id
    AND q.used_bytes IS DISTINCT FROM a.total;

  GET DIAGNOSTICS corrected_count = ROW_COUNT;
  RETURN corrected_count;
END;
$$;

-- pg_cron が有効な場合の日次スケジュール（手動で有効化）:
-- SELECT cron.schedule('reconcile-quotas', '0 3 * * *', 'SELECT public.reconcile_storage_quotas()');
