-- Add auth_user_id column to users table to link profiles to Supabase Auth users
-- Run this migration on your Supabase project (via SQL editor or migration tooling)

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- Optional: index for faster lookups by auth_user_id
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users (auth_user_id);

-- Optional: make auth_user_id unique if each profile maps 1:1 to auth user
-- ALTER TABLE public.users ADD CONSTRAINT users_auth_user_id_unique UNIQUE (auth_user_id);
