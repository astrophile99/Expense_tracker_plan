-- =====================================================
-- Finance Tracker - Auth Sync Trigger & Personal Workspace
-- Migration: 00004_triggers
-- =====================================================
-- Run after schema, indexes, and RLS have been applied.
-- Creates trigger that automatically:
--   1. Inserts into public.users
--   2. Inserts into public.profiles
--   3. Creates a personal workspace
--   4. Adds the user as workspace owner
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_workspace_id UUID;
BEGIN
  -- 1. Create user record
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);

  -- 2. Create profile
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );

  -- 3. Create personal workspace
  INSERT INTO public.workspaces (name, description, icon, created_by)
  VALUES (
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User') || '''s Workspace',
    'Personal workspace',
    'home',
    NEW.id
  )
  RETURNING id INTO v_workspace_id;

  -- 4. Add user as workspace owner
  INSERT INTO public.workspace_members (workspace_id, user_id, role, joined_at)
  VALUES (v_workspace_id, NEW.id, 'owner', NOW());

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
