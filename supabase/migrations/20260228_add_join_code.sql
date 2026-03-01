-- Migration: Add join_code column to albums
-- T06a: アルバム参加に招待コード（合言葉）を必須化
--
-- 実行方法: Supabase Dashboard > SQL Editor でこのSQLを実行
-- PostgreSQL 11+ では NOT NULL DEFAULT の ADD COLUMN で既存行も自動的にデフォルト値が入る

ALTER TABLE public.albums
  ADD COLUMN IF NOT EXISTS join_code text
    NOT NULL
    DEFAULT encode(gen_random_bytes(5), 'hex')
    UNIQUE;
