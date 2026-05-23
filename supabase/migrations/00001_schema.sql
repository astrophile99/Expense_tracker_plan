-- =====================================================
-- Finance Tracker - Production Database Schema
-- Engine: PostgreSQL 15+ / Supabase
-- Migration: 00001_schema
-- =====================================================

-- ────────────────────────────────────────
-- ENUM TYPES
-- ────────────────────────────────────────

CREATE TYPE transaction_type AS ENUM ('expense', 'income', 'cashback', 'refund', 'debt', 'transfer');
CREATE TYPE transaction_visibility AS ENUM ('private', 'workspace');
CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE recurrence_frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE budget_period AS ENUM ('weekly', 'monthly', 'yearly');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired', 'cancelled');
CREATE TYPE payment_method AS ENUM (
  'credit_card', 'debit_card', 'bank_transfer', 'paypal',
  'cash', 'apple_pay', 'google_pay', 'venmo', 'crypto', 'other'
);
CREATE TYPE currency_code AS ENUM (
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL'
);

-- ────────────────────────────────────────
-- CORE TABLES
-- ────────────────────────────────────────

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 100),
  avatar_url TEXT CHECK (avatar_url IS NULL OR avatar_url ~ '^https?://'),
  currency currency_code NOT NULL DEFAULT 'USD',
  timezone TEXT NOT NULL DEFAULT 'UTC' CHECK (timezone IS NOT NULL),
  locale TEXT NOT NULL DEFAULT 'en-US',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────
-- WORKSPACE SYSTEM
-- ────────────────────────────────────────

CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 500),
  icon TEXT,
  color TEXT CHECK (color IS NULL OR color ~ '^#[0-9a-fA-F]{6}$'),
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role workspace_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE TABLE public.workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role workspace_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status invitation_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, email, status)
);

-- ────────────────────────────────────────
-- CATEGORIES
-- ────────────────────────────────────────

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  icon TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
  "group" TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT category_owner_check CHECK (
    (workspace_id IS NOT NULL AND user_id IS NULL) OR
    (workspace_id IS NULL AND user_id IS NOT NULL) OR
    (workspace_id IS NULL AND user_id IS NULL AND is_default = TRUE)
  )
);

-- ────────────────────────────────────────
-- TRANSACTIONS
-- ────────────────────────────────────────

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  currency currency_code NOT NULL DEFAULT 'USD',
  type transaction_type NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  subcategory TEXT CHECK (subcategory IS NULL OR char_length(subcategory) <= 50),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 1 AND 200),
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 2000),
  tags TEXT[] NOT NULL DEFAULT '{}' CHECK (array_length(tags, 1) <= 20),
  payment_method payment_method,
  transaction_date TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  visibility transaction_visibility NOT NULL DEFAULT 'private',
  is_reconciled BOOLEAN NOT NULL DEFAULT FALSE,
  receipt_url TEXT CHECK (receipt_url IS NULL OR receipt_url ~ '^https?://'),
  receipt_file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────
-- RECURRING TRANSACTIONS
-- ────────────────────────────────────────

CREATE TABLE public.recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  currency currency_code NOT NULL DEFAULT 'USD',
  type transaction_type NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  subcategory TEXT CHECK (subcategory IS NULL OR char_length(subcategory) <= 50),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 1 AND 200),
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 2000),
  tags TEXT[] NOT NULL DEFAULT '{}',
  payment_method payment_method,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  visibility transaction_visibility NOT NULL DEFAULT 'private',
  frequency recurrence_frequency NOT NULL,
  interval INTEGER NOT NULL DEFAULT 1 CHECK (interval BETWEEN 1 AND 365),
  start_date DATE NOT NULL,
  end_date DATE CHECK (end_date IS NULL OR end_date >= start_date),
  last_executed_at TIMESTAMPTZ,
  next_execution DATE NOT NULL,
  max_executions INTEGER CHECK (max_executions IS NULL OR max_executions BETWEEN 1 AND 365),
  executions_count INTEGER NOT NULL DEFAULT 0 CHECK (executions_count >= 0),
  is_paused BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ────────────────────────────────────────
-- BUDGETS
-- ────────────────────────────────────────

CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  currency currency_code NOT NULL DEFAULT 'USD',
  period budget_period NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE CHECK (end_date IS NULL OR end_date >= start_date),
  is_alert_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  alert_threshold INTEGER NOT NULL DEFAULT 80 CHECK (alert_threshold BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────
-- ACTIVITY LOGS
-- ────────────────────────────────────────

CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────
-- NOTIFICATIONS
-- ────────────────────────────────────────

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,
  action_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────
-- UPDATED AT TRIGGERS
-- ────────────────────────────────────────

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER set_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER set_recurring_updated_at
  BEFORE UPDATE ON public.recurring_transactions
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER set_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ────────────────────────────────────────
-- STORAGE BUCKET (run separately if needed)
-- ────────────────────────────────────────

-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);
