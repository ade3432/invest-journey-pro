-- Add is_premium column to user_progress table
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false;