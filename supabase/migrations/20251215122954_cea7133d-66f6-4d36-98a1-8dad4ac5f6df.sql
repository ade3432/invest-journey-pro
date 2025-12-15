-- Add column to track when hearts were last updated for auto-refill
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS last_heart_update timestamp with time zone DEFAULT now();