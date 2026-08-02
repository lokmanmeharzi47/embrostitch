-- Migration: Fix user verification, auto-create creator profiles, and sync user roles
-- Date: 2026-08-02

-- 1. Backfill missing profiles for existing auth.users
INSERT INTO public.profiles (id, email, first_name, last_name, role, avatar_url)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data ->> 'first_name', ''),
  COALESCE(u.raw_user_meta_data ->> 'last_name', ''),
  COALESCE(
    CASE 
      WHEN u.raw_user_meta_data ->> 'role' = 'couturiere' THEN 'creator'
      ELSE u.raw_user_meta_data ->> 'role'
    END,
    'client'
  ),
  COALESCE(u.raw_user_meta_data ->> 'avatar_url', '')
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = CASE 
    WHEN EXCLUDED.role = 'couturiere' THEN 'creator' 
    ELSE COALESCE(profiles.role, EXCLUDED.role) 
  END;

-- 2. Normalize existing couturiere roles to creator in profiles & auth.users
UPDATE public.profiles SET role = 'creator' WHERE role = 'couturiere';

UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "creator"}'::jsonb
WHERE raw_user_meta_data ->> 'role' = 'couturiere';

-- 3. Backfill missing creator_profiles rows for existing creator users
INSERT INTO creator_profiles (id, is_verified)
SELECT id, false FROM profiles 
WHERE role IN ('creator', 'couturiere')
ON CONFLICT (id) DO NOTHING;

-- 4. Allow Admins to INSERT into creator_profiles
DROP POLICY IF EXISTS "admin_insert_creator_profiles" ON creator_profiles;
CREATE POLICY "admin_insert_creator_profiles" ON creator_profiles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 5. RPC to update user role across profiles and auth.users
CREATE OR REPLACE FUNCTION admin_update_user_role(p_user_id uuid, p_new_role text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_normalized_role text := CASE WHEN p_new_role = 'couturiere' THEN 'creator' ELSE p_new_role END;
BEGIN
  -- Upsert profiles
  INSERT INTO public.profiles (id, role)
  VALUES (p_user_id, v_normalized_role)
  ON CONFLICT (id) DO UPDATE SET role = v_normalized_role;

  -- Update auth.users metadata
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', v_normalized_role)
  WHERE id = p_user_id;

  -- Ensure creator_profiles if creator
  IF v_normalized_role = 'creator' THEN
    INSERT INTO public.creator_profiles (id, is_verified)
    VALUES (p_user_id, false)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN json_build_object('success', true, 'role', v_normalized_role);
END;
$$;

-- 6. Trigger to automatically sync creator profile on user creation / role update
CREATE OR REPLACE FUNCTION handle_creator_profile_auto_create()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.role IN ('creator', 'couturiere') THEN
    INSERT INTO public.creator_profiles (id, is_verified)
    VALUES (NEW.id, false)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_create_creator_profile ON public.profiles;
CREATE TRIGGER trg_auto_create_creator_profile
AFTER INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION handle_creator_profile_auto_create();
